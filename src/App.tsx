import "./css/App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import BleachLayout from "./components/BleachLayout";
import BleachDex from "./components/BleachDex";

function App() {
  return (
    // Real paths (/bleachdex3d/12) rather than a hash: GitHub Pages serves one
    // HTML file per character, written at build time (see vite.config.ts).
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<BleachDex />} />
        <Route path="/:bleachId" element={<BleachLayout />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
