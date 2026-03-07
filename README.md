# Three-Dimensional Point Cloud Viewer

An interactive **web-based 3D point cloud viewer** built with **Three.js**.

This project demonstrates how large-scale point cloud datasets can be visualized directly in the browser using modern WebGL technologies. Users can freely rotate, zoom, and explore the spatial structure of the point cloud in real time.

The viewer was developed as an exploration into **web-based spatial data visualization**, with potential applications in fields such as:

- LiDAR visualization
- Surveying and mapping
- Construction monitoring
- Infrastructure inspection
- Offshore wind inspection
- Digital twin visualization

A live demo is available via **GitHub Pages**.

---

## Features

- Interactive 3D point cloud visualization
- Orbit / zoom / pan camera controls
- Real-time WebGL rendering
- Responsive viewer layout
- Optimized loading for large point cloud datasets
- BIN-based point cloud rendering workflow

---

## Tech Stack

- Three.js
- WebGL
- Vite
- TailwindCSS

---

## Project Structure

three-dimensional-PointCloud
├── public/ # point cloud assets and static files
├── src/ # viewer logic and components
├── index.html # entry page
├── vite.config.js
└── package.json


---

## Running the Project Locally

Clone the repository:

git clone https://github.com/your-username/three-dimensional-PointCloud.git


Install dependencies:

npm install

Start the development server:

npm run dev


Then open the local address shown in the terminal.

---

## Point Cloud Dataset

The point cloud used in this demo has been converted into an optimized **BIN format** for efficient browser-based visualization.

The original high-resolution point cloud datasets (PLY) are not included in this repository due to their large file size.

The included BIN dataset is provided **for personal viewing and demonstration purposes only**.

If you are interested in the dataset for research, development, or collaboration purposes, please contact the author.

---

## Author

**Sakiii CHU**
