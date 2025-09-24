import React, { useState, useEffect, useRef } from "react";
import foodIcon from "../../assets/images/food-icon.png";
import EncouragementToast from "./EncouragementToast.jsx";

export default function FoodLogs({ date, userId }) {
  const [foodItem, setFoodItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("piece");
  const [foodLogs, setFoodLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef(""); // <-- track last milestone

  useEffect(() => {
    fetch("http://localhost:3000/api/food_logs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setFoodLogs)
      .catch(console.error);
  }, []);

  const handleAddFood = async () => {
    if (!foodItem || quantity <= 0 || !unit) return alert("Enter all fields!");

    try {
      const res = await fetch("http://localhost:3000/api/food_logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date,
          food_item: foodItem,
          quantity: Number(quantity),
          unit,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add food log");
      }

      const data = await res.json();
      setFoodLogs([data, ...foodLogs]);
      setFoodItem("");
      setQuantity(1);
      setUnit("piece");

      // Fetch milestone from backend
      const milestoneRes = await fetch(
        `http://localhost:3000/api/encouragements/all/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (milestoneRes.ok) {
        const milestoneData = await milestoneRes.json();
        const latest = milestoneData.Food;

        // Only show toast if it's a new milestone
        if (latest && latest !== lastMilestoneRef.current) {
          setToastMessage(latest);
          lastMilestoneRef.current = latest;
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error adding food log: " + err.message);
    }
  };

  return (
    <div className="food-log-container">
      <div className="food-log">
        <img
          src={foodIcon}
          alt="Food"
          style={{ width: "40px", height: "40px", marginRight: "10px" }}
        />

        <input
          type="text"
          placeholder="Food Item"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          min="0.1"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="piece">Piece</option>
          <option value="gram">Gram</option>
          <option value="cup">Cup</option>
        </select>
        <button className="submit-btn" onClick={handleAddFood}>
          Add
        </button>
      </div>

      {/* Toast */}
      <EncouragementToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
