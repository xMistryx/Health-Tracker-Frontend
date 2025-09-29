// src/components/EncouragementToast.jsx
import React from "react";
import "./Encouragement.css";

export default function Encouragement({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="encouragement-container">
      <div className="encouragement-message">
        <span>{message}</span>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}