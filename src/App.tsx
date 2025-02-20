import "./css/App.css";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

import BleachLayout from "./components/BleachLayout";
import BleachDex from "./components/BleachDex";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BleachDex />} />
        <Route path="/:bleachId" element={<BleachLayout />} />
        <Route path="/*/*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
