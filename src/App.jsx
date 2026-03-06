import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./index.css";
import { CenteredModelBINGZ } from "./components/CenteredModelBINGZ";

export default function App() {
  const BASE = import.meta.env.BASE_URL;
  const controlsRef = useRef(null);

  const [viewMode, setViewMode] = useState("part1"); // part1 | both | part2
  const [showGuide, setShowGuide] = useState(false);
  const [part2Enabled, setPart2Enabled] = useState(false);

  const viewModeLabel = useMemo(() => {
    if (viewMode === "part1") return "PART 1";
    if (viewMode === "part2") return "PART 2";
    return "BOTH";
  }, [viewMode]);

  const toggleMode = () => {
    setViewMode((m) =>
      m === "part1" ? "both" : m === "both" ? "part2" : "part1",
    );
  };

  const handleResetView = () => {
    controlsRef.current?.reset();
  };

  return (
    <div className="bg-black min-h-screen flex flex-col text-white">
      <nav className="flex items-center justify-between px-6 py-3 bg-black shadow-md sticky top-0 z-50">
        <a
          href="#"
          className="text-2xl font-bold text-gray-300 hover:underline"
        >
          Linkou 3D Point Cloud
        </a>

        <a
          href="https://github.com/SakiiiCHU/three-dimensional-PointCloud"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-gray-500"
        >
          GitHub Code
        </a>
      </nav>

      <div className="flex flex-1">
        <aside className="w-72 p-5 bg-black border-r border-gray-800">
          <div>
            <h2 className="text-lg font-semibold mb-2">Viewer</h2>

            <p className="text-sm text-gray-400 leading-relaxed">
              LiDAR point cloud of Linkou District, New Taipei City.
              <br />
              <span className="text-gray-500">Drag • Zoom • Pan freely.</span>
              <br />
              <span className="text-gray-500">
                Tip: if you get lost, press{" "}
                <b className="text-gray-200">Reset View</b>.
              </span>
            </p>

            <button
              onClick={toggleMode}
              className="mt-4 w-full h-12 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              View Mode: {viewModeLabel}
            </button>

            <div className="mt-2 text-xs text-gray-500">
              {part2Enabled
                ? "Part 2 is ready to load."
                : "Loading Part 1 first..."}
            </div>

            {/* <div className="mt-2 text-[11px] text-gray-600 break-all">
              BASE_URL: {BASE}
            </div> */}
          </div>

          <div className="mt-6 border-t border-gray-800 pt-5 space-y-3">
            <h2 className="text-lg font-semibold mb-2">Controls</h2>

            <button
              onClick={() => setShowGuide(true)}
              className="w-full h-14 rounded-xl flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 font-medium transition"
            >
              <span>How to Use</span>
            </button>

            <button
              onClick={handleResetView}
              className="w-full h-14 rounded-xl flex items-center justify-center gap-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.99] transition-transform"
            >
              <span>Reset View</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 relative">
          <Canvas
            className="absolute inset-0"
            camera={{ position: [10, 12, 1], fov: 40 }}
            gl={{
              antialias: true,
              alpha: false,
              toneMapping: THREE.NoToneMapping, // avoid extra "wash"
              outputColorSpace: THREE.SRGBColorSpace, // explicit
            }}
          >
            <color attach="background" args={["#111111"]} />

            <Suspense fallback={null}>
              {(viewMode === "part1" || viewMode === "both") && (
                <CenteredModelBINGZ
                  previewUrl={`${BASE}linkou_1_preview.bin.gz`}
                  url={`${BASE}linkou_1.bin.gz`}
                  enabled={true}
                  onFullLoaded={() => setPart2Enabled(true)}
                  pointSize={0.008}
                />
              )}

              {(viewMode === "part2" || viewMode === "both") && (
                <CenteredModelBINGZ
                  previewUrl={`${BASE}linkou_2_preview.bin.gz`}
                  url={`${BASE}linkou_2.bin.gz`}
                  enabled={part2Enabled}
                  pointSize={0.008}
                />
              )}
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enablePan
              enableZoom
              enableRotate
              enableDamping
              dampingFactor={0.08}
            />
          </Canvas>

          {showGuide && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-6">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Quick Controls</h2>
                  <button
                    onClick={() => setShowGuide(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    🖱️ <b>Left drag</b> — rotate
                  </p>
                  <p>
                    🌀 <b>Scroll</b> — zoom
                  </p>
                  <p>
                    🧭 <b>Right drag</b> — pan
                  </p>

                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    Tip: If you get lost, press <b>Reset View</b>.
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Part 2 starts loading after Part 1 finishes.
                  </div>
                </div>

                <div className="mt-5 text-right">
                  <button
                    onClick={() => setShowGuide(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer bg-dark text-light py-3 text-center">
        <p className="small weight-300 text-gray-500">
          📧 Email: <a href="mailto:sakiiichu@gmail.com">sakiichu@gmail.com</a>{" "}
          | 🔗 GitHub:{" "}
          <a
            href="https://github.com/SakiiiCHU"
            target="_blank"
            rel="noopener noreferrer"
          >
            SakiiiCHU
          </a>
        </p>
        <p className="small weight-300 text-gray-500">
          ©2026 Ting-Chen Chu. This project is for educational and demonstration
          purposes only, non-commercial use.
        </p>
      </footer>
    </div>
  );
}
