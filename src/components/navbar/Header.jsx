import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>

        {/* Progress with Dropdown */}
        <li
          className="dropdown"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span className="dropbtn">Progress ▾</span>
          {showDropdown && (
            <ul className="dropdown-content">
              <li>
                <Link to="/progress/water">Water</Link>
              </li>
              <li>
                <Link to="/progress/sleep">Sleep</Link>
              </li>
              <li>
                <Link to="/progress/exercise">Exercise</Link>
              </li>
              <li>
                <Link to="/progress/food">Food</Link> {/* Added Food here */}
              </li>
            </ul>
          )}
        </li>

        <li>
          <button className="signout-btn">Sign Out</button>
        </li>
      </ul>
    </nav>
  );
}
