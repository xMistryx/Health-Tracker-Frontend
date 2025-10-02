// src/components/EncouragementToast.jsx
import React from "react";
import useQuery from "../api/useQuery";
import "./Encouragement.css";

export default function Encouragement({ category = "water", milestone = "FirstLog", onClose }) {
  const { data, loading, error } = useQuery(`/encouragements/${category}/${milestone}`);
  const encouragement = data && data.length ? data[0] : null;
  const message = encouragement?.message;

  if (!category || !milestone) return null;

  const cleanText = (text) => {
    if (!text) return text;
    return text
      .replace(/\u00e2\u20ac\u201d/g, " — ")
      .replace(/â€"/g, " — ")
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€"/g, "—")
      .replace(/â€"/g, "–")
      .replace(/""/g, " — ")
      .replace(/Â/g, "");
  };

  if (loading) {
    return (
      <div className="encouragement-container">
      <div className="encouragement-message">
        <span>Loading encouragement...</span>
      </div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="encouragement-container">
      <div className="encouragement-message">
        <span>Unable to load encouragement at the moment.</span>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
    );
  }

  if (!message) {
    return (
      <div className="encouragement-container">
      <div className="encouragement-message">
        <span>No encouragement available.</span>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
    );
  }

  return (
    <div className="encouragement-container">
      <div className="encouragement-message">
        <span>{cleanText(message)}</span>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}