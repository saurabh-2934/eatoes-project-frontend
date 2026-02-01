import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MenuProvider } from "./context/MenuContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";

function App() {
  return (
    <MenuProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManagement />} />
        </Routes>
      </Router>
    </MenuProvider>
  );
}

export default App;
