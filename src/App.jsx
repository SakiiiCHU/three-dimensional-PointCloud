import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./index.css";
import { CenteredModelPLY } from "./components/CenteredModelPLY";

function App() {
  const [activePart, setActivePart] = useState(1);

  const togglePart = () => setActivePart(activePart === 1 ? 2 : 1);

  return (
    <div className="bg-black min-h-screen flex flex-col text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-3 bg-black shadow-md sticky top-0 z-50">
        <a
          href="#"
          className="text-2xl font-bold text-gray-300 hover:underline"
        >
          Linkou 3D Point Cloud
        </a>

        <a
          href="https://github.com/SakiiiCHU"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-gray-500 flex items-center space-x-1"
        >
          <span className="material-icons">code</span>
          <span>GitHub</span>
        </a>
      </nav>

      {/* Main content */}
      <div className="flex flex-1">
        <aside className="w-64 p-4 bg-black border-r border-gray-700">
          <div>
            <h2 className="text-lg font-semibold mb-2">Exhibition Info</h2>
            <p className="text-sm text-gray-300">
              This is a 3D point cloud model of Linkou District, New Taipei
              City.（林口區）
              <br />- Author: Ting-Chen Chu
              <br />- You can rotate, zoom, and pan it!
            </p>
            <button
              onClick={togglePart}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Toggle Building Part: {activePart}
            </button>
          </div>
          <div className="mt-6 border-t border-gray-600 pt-4">
            <h2 className="text-lg font-semibold mb-3">Actions</h2>
            <button className="flex items-center space-x-2 w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md mb-3">
              <span className="material-icons">favorite_border</span>
              <span>Add to Favorites</span>
            </button>
            <button className="flex items-center space-x-2 w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-md hover:scale-105 transition transform shadow-md">
              <span className="material-icons">shopping_cart</span>
              <span>Buy Now</span>
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative">
          <Canvas
            className="absolute top-0 left-0 w-full h-full"
            camera={{ position: [0, 0, 20], fov: 60 }}
          >
            <color attach="background" args={["#111111"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />

            <Suspense fallback={null}>
              {activePart === 1 ? (
                <CenteredModelPLY url="/three-dimensional-PointCloud/ply/linco_cd_densified_point_cloud_part_4_part1.ply" />
              ) : (
                <CenteredModelPLY url="/three-dimensional-PointCloud/ply/linco_cd_densified_point_cloud_part_4_part2.ply" />
              )}
            </Suspense>

            <OrbitControls enablePan enableZoom enableRotate />
          </Canvas>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer bg-dark text-light py-3 text-center">
        <p className="mb-1 small">
          📧 Email: <a href="mailto:tingccc93@gmail.com">tingccc93@gmail.com</a>{" "}
          | 🔗 GitHub:{" "}
          <a
            href="https://github.com/SakiiiCHU"
            target="_blank"
            rel="noopener noreferrer"
          >
            SakiiiCHU
          </a>
        </p>
        <p className="small fw-light mb-0">
          ©2024 Ting-Chen Chu. This project is for educational and demonstration
          purposes only, non-commercial use.
        </p>
      </footer>
    </div>
  );
}

export default App;
