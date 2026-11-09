/**
 * Importing React and the NavBar CSS.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/navbar.css";

/**
 * NavBar component renders the navigation bar for the BleachDex 3D application.
 * It includes links to the Home, About, and Contact pages.
 *
 * @component
 * @example
 * return (
 *   <NavBar />
 * )
 */
const NavBar: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav id="navbar">
      {/* data-nosnippet: the clock and the links are no text for Google to quote */}
      <div className="navbar-bleach" data-nosnippet>
        {/* Phones show the short labels: the long ones overflowed the bar */}
        <div className="navbar-link">
          <Link to="/" aria-label="Back to the BleachDex">
            <span className="label-long">Back to the BleachDex</span>
            <span className="label-short" aria-hidden="true">BleachDex</span>
          </Link>
        </div>
        <div className="navbar-time">{time}</div>
        <div className="navbar-link">
          <a
            href="https://fchapoulliep.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Creator's portfolio"
          >
            <span className="label-long">Creator's portfolio</span>
            <span className="label-short" aria-hidden="true">Portfolio</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
