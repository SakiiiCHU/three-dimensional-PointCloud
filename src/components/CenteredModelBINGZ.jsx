import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import pako from "pako";

/**
 * sRGB -> Linear (for vertex colors)
 * This prevents "washed-out / too white" appearance under SRGB output.
 */
function srgbToLinear(c) {
  // c: 0..1
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * BIN format:
 * 1 point = 15 bytes = xyz(float32*3=12) + rgb(uint8*3=3)
 */
function parseBinXYZRGB(buffer) {
  const pointSize = 15;
  const numPoints = Math.floor(buffer.byteLength / pointSize);

  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);
  const dv = new DataView(buffer);

  for (let i = 0; i < numPoints; i++) {
    const o = i * pointSize;

    const x = dv.getFloat32(o + 0, true);
    const y = dv.getFloat32(o + 4, true);
    const z = dv.getFloat32(o + 8, true);

    // 0..1 in sRGB
    const r = dv.getUint8(o + 12) / 255;
    const g = dv.getUint8(o + 13) / 255;
    const b = dv.getUint8(o + 14) / 255;

    const j = i * 3;
    positions[j] = x;
    positions[j + 1] = y;
    positions[j + 2] = z;

    // ✅ Convert to linear to avoid washed-out colors
    colors[j] = srgbToLinear(r);
    colors[j + 1] = srgbToLinear(g);
    colors[j + 2] = srgbToLinear(b);
  }

  return { positions, colors, numPoints };
}

async function loadMaybeCompressedBin(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);

  const bytes = new Uint8Array(await res.arrayBuffer());
  console.log("[BINGZ] fetched bytes:", bytes.byteLength, "url:", url);

  // gzip magic number: 1f 8b
  const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  console.log(
    "[BINGZ] header:",
    bytes[0]?.toString(16),
    bytes[1]?.toString(16),
    "isGzip:",
    isGzip
  );

  let rawBuffer;

  if (isGzip) {
    const decompressed = pako.ungzip(bytes);
    console.log("[BINGZ] ungzipped bytes:", decompressed.byteLength, "url:", url);
    rawBuffer = decompressed.buffer;
  } else {
    // Vite dev may already serve decompressed content
    console.log("[BINGZ] using fetched bytes directly as raw BIN");
    rawBuffer = bytes.buffer;
  }

  return parseBinXYZRGB(rawBuffer);
}

/**
 * Same transform pipeline as your old point-cloud.js:
 * - center by bbox
 * - scale to 12/maxDim
 * - swap y/z => (x, z, y)
 */
function transformLikeOld(positions, colors) {
  const tempGeometry = new THREE.BufferGeometry();
  tempGeometry.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));

  tempGeometry.computeBoundingBox();
  const box = tempGeometry.boundingBox;

  if (!box) {
    tempGeometry.dispose();
    return { positions, colors };
  }

  const center = new THREE.Vector3();
  box.getCenter(center);
  tempGeometry.translate(-center.x, -center.y, -center.z);

  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 12 / maxDim;
  tempGeometry.scale(scale, scale, scale);

  // swap y/z => (x, z, y)
  const arr = tempGeometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    const x = arr[i];
    const y = arr[i + 1];
    const z = arr[i + 2];
    arr[i] = x;
    arr[i + 1] = z;
    arr[i + 2] = y;
  }

  tempGeometry.dispose();
  return { positions: arr, colors };
}

function buildGeometry(positions, colors) {
  const t = transformLikeOld(positions, colors);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(t.positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(t.colors, 3));
  g.attributes.position.needsUpdate = true;
  g.attributes.color.needsUpdate = true;

  return g;
}

export function CenteredModelBINGZ({
  previewUrl,
  url,
  enabled = true,
  onFullLoaded,
  pointSize = 0.008,
}) {
  const pointsRef = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const onFullLoadedRef = useRef(onFullLoaded);
  const hasLoadedFullRef = useRef(false);

  useEffect(() => {
    onFullLoadedRef.current = onFullLoaded;
  }, [onFullLoaded]);

  const material = useMemo(() => {
    const m = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      transparent: false, // ✅ avoid "white haze" from blending
      opacity: 1,
      sizeAttenuation: true,
      depthWrite: true,
      depthTest: true,
    });

    m.blending = THREE.NormalBlending;
    return m;
  }, [pointSize]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const swapGeometry = (newGeom) => {
      if (!pointsRef.current) {
        setGeometry(newGeom);
        return;
      }
      const old = pointsRef.current.geometry;
      pointsRef.current.geometry = newGeom;
      if (old) old.dispose();
    };

    (async () => {
      try {
        if (previewUrl) {
          console.log("[BINGZ] preview fetch:", previewUrl);
          const preview = await loadMaybeCompressedBin(previewUrl);
          if (cancelled) return;

          console.log("[BINGZ] preview points:", preview.numPoints);
          const g0 = buildGeometry(preview.positions, preview.colors);
          setGeometry(g0);
        }

        if (url) {
          console.log("[BINGZ] full fetch:", url);
          const full = await loadMaybeCompressedBin(url);
          if (cancelled) return;

          console.log("[BINGZ] full points:", full.numPoints);
          const g1 = buildGeometry(full.positions, full.colors);
          swapGeometry(g1);

          if (!hasLoadedFullRef.current) {
            hasLoadedFullRef.current = true;
            onFullLoadedRef.current?.();
          }
        }
      } catch (e) {
        console.warn("[BINGZ] load failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (pointsRef.current?.geometry) pointsRef.current.geometry.dispose();
      setGeometry(null);
    };
  }, [enabled, previewUrl, url]);

  if (!geometry) return null;

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}