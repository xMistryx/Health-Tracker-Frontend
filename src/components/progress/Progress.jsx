import React from "react";
import { useNavigate } from "react-router-dom";

export default function Progress() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ⬅ Back
      </button>

      {/* Navigation buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => navigate("/progress/water")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Water
        </button>
        <button
          onClick={() => navigate("/progress/sleep")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Sleep
        </button>
        <button
          onClick={() => navigate("/progress/exercise")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Exercise
        </button>
      </div>

      {/* Placeholder text */}
      <p className="text-gray-600">
        Select a log above to view details and progress.
      </p>
    </div>
  );
}
