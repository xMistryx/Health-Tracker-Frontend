// src/components/progress/FoodProgress.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import "./FoodProgress.css";

// Format date as "Sep 21, 2025"
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Determine block intensity based on calories
const getIntensityClass = (calories) => {
  if (!calories) return "intensity-1"; // handle missing calories
  if (calories >= 500) return "intensity-5";
  if (calories >= 400) return "intensity-4";
  if (calories >= 300) return "intensity-3";
  if (calories >= 200) return "intensity-2";
  return "intensity-1";
};

// Visual row for a single day
function FoodRow({ label, meals, isToday }) {
  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );
  const totalProtein = meals.reduce(
    (sum, m) => sum + Number(m.protein || 0),
    0
  );
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + Number(m.fat || 0), 0);
  const totalFiber = meals.reduce((sum, m) => sum + Number(m.fiber || 0), 0);

  return (
    <div className={`food-row ${isToday ? "today" : ""}`}>
      <span className="day-label">{label}</span>
      <div className="meal-blocks">
        {meals.length === 0 ? (
          <span
            className="empty"
            title={`No meals logged today.
Total Calories: 0
Protein: 0g
Carbs: 0g
Fat: 0g
Fiber: 0g`}
          >
            No meals
          </span>
        ) : (
          meals.map((meal, i) => (
            <div
              key={i}
              className={`meal-block ${getIntensityClass(meal.calories)}`}
              title={`Food: ${meal.food_item}
Calories: ${meal.calories} cal
Protein: ${meal.protein} g
Carbs: ${meal.carbs} g
Fat: ${meal.fat} g
Fiber: ${meal.fiber || 0} g`}
            >
              {meal.food_item}
            </div>
          ))
        )}
      </div>
      <span
        className="day-total"
        title={`Total Intake:
Calories: ${totalCalories} cal
Protein: ${totalProtein} g
Carbs: ${totalCarbs} g
Fat: ${totalFat} g
Fiber: ${totalFiber} g`}
      >
        {meals.length} meals
      </span>
    </div>
  );
}

export default function FoodProgress() {
  const navigate = useNavigate();
  const [range, setRange] = useState("week");
  const [foodLogs, setFoodLogs] = useState({}); // grouped by date

  // Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:3000/api/food_logs", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch food logs");
        const raw = await res.json();
        const grouped = raw.reduce((acc, row) => {
          const date = row.date.split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(row);
          return acc;
        }, {});
        setFoodLogs(grouped);
      } catch (err) {
        console.error("fetchLogs error:", err);
      }
    }
    fetchLogs();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  function fillMissingDates(logs, length) {
    const result = [];
    for (let i = 0; i < length; i++) {
      const d = new Date();
      if (length === 7) d.setDate(d.getDate() - (6 - i));
      if (length === 30) d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        label: formatDate(d),
        meals: logs[dateStr] || [],
      });
    }
    return result;
  }

  let data = [];
  if (range === "today") {
    data = [
      {
        date: todayStr,
        label: formatDate(todayStr),
        meals: foodLogs[todayStr] || [],
      },
    ];
  } else if (range === "yesterday") {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const dateStr = y.toISOString().split("T")[0];
    data = [
      {
        date: dateStr,
        label: formatDate(dateStr),
        meals: foodLogs[dateStr] || [],
      },
    ];
  } else if (range === "week") {
    data = fillMissingDates(foodLogs, 7);
  } else if (range === "month") {
    data = fillMissingDates(foodLogs, 30);
  }

  // Summary
  const totalMeals = data.reduce((sum, d) => sum + d.meals.length, 0);
  const avgMeals = (totalMeals / data.length).toFixed(1);

  let summary = "";
  if (range === "today") summary = `Today you logged ${totalMeals} meals.`;
  else if (range === "yesterday")
    summary = `Yesterday you logged ${totalMeals} meals.`;
  else if (range === "week")
    summary = `This week you logged ${totalMeals} meals (avg ${avgMeals}/day).`;
  else if (range === "month")
    summary = `This month you logged ${totalMeals} meals (avg ${avgMeals}/day).`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Food Progress</h1>
      <div className="progress-container">
        {/* Left navigation */}
        <div className="left-column">
          <button onClick={() => navigate("/dashboard")} className="btn">
            ⬅ Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/progress/water")}
            className="btn btn-water"
          >
            Water
          </button>
          <button
            onClick={() => navigate("/progress/sleep")}
            className="btn btn-sleep"
          >
            Sleep
          </button>
          <button
            onClick={() => navigate("/progress/exercise")}
            className="btn btn-exercise"
          >
            Exercise
          </button>
          <button
            onClick={() => navigate("/progress/food")}
            className="btn btn-food"
          >
            Food
          </button>
        </div>

        {/* Right content */}
        <div className="right-column">
          <div className="range-buttons">
            {["today", "yesterday", "week", "month"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={range === r ? "btn-range active" : "btn-range"}
              >
                {r === "week"
                  ? "1 Week"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <p className="font-bold mb-4">{summary}</p>

          <div className="food-grid">
            {data.map((d) => (
              <FoodRow
                key={d.date}
                label={d.label}
                meals={d.meals}
                isToday={d.date === todayStr}
              />
            ))}
          </div>

          <div className="mt-6">
            <TipBox category="Food" />
          </div>
        </div>
      </div>
    </div>
  );
}
