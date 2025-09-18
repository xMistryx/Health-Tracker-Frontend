import React from "react";
import { Link } from "react-router-dom";
import heartIcon from "../../assets/images/hearticon.png"; // Add your icon here

export default function Header({ user, onSignOut }) {
  return (
    <nav
      className="flex justify-between items-center p-4 bg-blue-500 text-white"
      style={{ padding: "10px 20px" }}
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        <img
          src={heartIcon}
          alt="Heart Icon"
          style={{ width: 30, height: 30 }}
        />
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Health Tracker
        </h1>
      </div>

      {/* Right side */}
      <div className="flex gap-4 items-center">
        <Link to="/profile" className="hover:underline">
          Profile
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <button onClick={onSignOut} className="bg-red-500 px-3 py-1 rounded">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
