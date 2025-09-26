import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (window.confirm("Do you want to sign out?")) {
      localStorage.removeItem("token");
      navigate("/"); // goes back to home/sign-in page
    }
  };

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
        <li>
          <Link to="/progress/water">Progress</Link>
        </li>
        <li>
          <span className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </span>
        </li>
      </ul>
    </nav>
  );
}
