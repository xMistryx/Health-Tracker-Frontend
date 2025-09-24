// src/components/EncouragementToast.jsx
import React from "react";
import "./EncouragementToast.css";

export default function EncouragementToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className="toast-message">
        <span>{message}</span>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}
