import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // Import the CSS file

export default function Header({ user, onSignOut }) {
  return (
    <nav className="header-nav">
      <div className="header-right">
        <Link to="/profile" className="header-link">
          Profile
        </Link>
        <Link to="/dashboard" className="header-link">
          Dashboard
        </Link>
        <button onClick={onSignOut} className="signout-btn">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
