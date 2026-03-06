import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./index.css";
import "./App.css";
import { CenteredModelBINGZ } from "./components/CenteredModelBINGZ";

export default function App() {
  const BASE = import.meta.env.BASE_URL;
  const controlsRef = useRef(null);

  const [viewMode, setViewMode] = useState("part1"); // part1 | both | part2
  const [showGuide, setShowGuide] = useState(false);
  const [part2Enabled, setPart2Enabled] = useState(false);

  // loading overlay for canvas
  const [isLoading, setIsLoading] = useState(true);

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

  const handleResetView = () => controlsRef.current?.reset();

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* NAV */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black shadow-md sticky top-0 z-50">
        <a
          href="#"
          className="text-lg sm:text-2xl font-bold text-gray-300 hover:underline"
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

      {/* MAIN: mobile = column, desktop = row */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* PANEL */}
        <aside className="w-full md:w-72 bg-black border-b md:border-b-0 md:border-r border-gray-800 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold mb-1">
                Viewer
              </h2>

              <p className="text-sm text-gray-400 leading-relaxed">
                High-resolution 3D point cloud of Linkou District, New Taipei
                City, reconstructed from UAV aerial imagery.
              </p>

              <ul className="mt-3 space-y-1 text-sm text-gray-500 list-disc pl-5">
                <li>Photogrammetric reconstruction (~6.9M points)</li>
                <li>Original dataset in PLY format (~90 MB per segment)</li>
                <li>
                  Converted to compressed BIN (.bin.gz) format for efficient web
                  visualization
                </li>
                <li>Interactive WebGL viewer</li>
              </ul>
            </div>

            {/* mobile quick buttons */}
            <div className="flex md:hidden gap-2 shrink-0">
              <button
                onClick={() => setShowGuide(true)}
                className="h-10 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
              >
                ?
              </button>
              <button
                onClick={handleResetView}
                className="h-10 px-3 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 text-sm font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {/* buttons grid */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-1 gap-3">
            <button
              onClick={toggleMode}
              className="col-span-2 md:col-span-1 h-11 md:h-12 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              View Mode: {viewModeLabel}
            </button>

            {/* desktop controls */}
            <div className="hidden md:block border-t border-gray-800 pt-4 space-y-3">
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
          </div>
        </aside>

        {/* CANVAS */}
        <main className="relative flex-1 min-h-0">
          <div className="absolute inset-0">
            <Canvas
              className="w-full h-full"
              camera={{ position: [10, 12, 1], fov: 40 }}
              gl={{
                antialias: true,
                alpha: false,
                toneMapping: THREE.NoToneMapping,
                outputColorSpace: THREE.SRGBColorSpace,
              }}
            >
              <color attach="background" args={["#111111"]} />

              <Suspense fallback={null}>
                {(viewMode === "part1" || viewMode === "both") && (
                  <CenteredModelBINGZ
                    previewUrl={`${BASE}linkou_1_preview.bin.gz`}
                    url={`${BASE}linkou_1.bin.gz`}
                    enabled={true}
                    onFullLoaded={() => {
                      setPart2Enabled(true);
                      setIsLoading(false);
                    }}
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
          </div>

          {/* LOADING OVERLAY */}
          {isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="px-5 py-3 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 shadow-lg">
                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Loading point cloud...</span>
                </div>
              </div>
            </div>
          )}

          {/* GUIDE OVERLAY */}
          {showGuide && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 max-w-md w-full">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Quick Controls</h2>
                  <button
                    onClick={() => setShowGuide(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    🖱️ <b>Left drag</b> — rotate
                  </p>
                  <p>
                    🌀 <b>Scroll / pinch</b> — zoom
                  </p>
                  <p>
                    🧭 <b>Right drag / two-finger drag</b> — pan
                  </p>

                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    Tip: If you get lost, press <b>Reset View</b>.
                  </div>
                </div>

                <div className="mt-4 text-right">
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

      {/* footer */}
      <footer className="footer bg-dark text-light py-3 text-center footer-text">
        <p className="small weight-300 text-gray-500">
          📧 Email: <a href="mailto:sakiiichu@gmail.com">sakiiichu@gmail.com</a>{" "}
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