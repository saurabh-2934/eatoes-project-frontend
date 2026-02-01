import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav
    style={{
      padding: "1rem",
      background: "#333",
      color: "#fff",
      display: "flex",
      gap: "20px",
    }}>
    <Link to="/" style={{ color: "#fff" }}>
      Dashboard
    </Link>
    <Link to="/menu" style={{ color: "#fff" }}>
      Menu Management
    </Link>
  </nav>
);

export default Navbar;
