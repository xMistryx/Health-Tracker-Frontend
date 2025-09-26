import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import Header from "../navbar/Header.jsx";
import "./FoodProgress.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const getIntensityClass = (calories) => {
  if (!calories) return "intensity-1";
  if (calories >= 500) return "intensity-5";
  if (calories >= 400) return "intensity-4";
  if (calories >= 300) return "intensity-3";
  if (calories >= 200) return "intensity-2";
  return "intensity-1";
};

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
            title={`No meals logged today.\nTotal Calories: 0\nProtein: 0g\nCarbs: 0g\nFat: 0g\nFiber: 0g`}
          >
            No meals
          </span>
        ) : (
          meals.map((meal, i) => (
            <div
              key={i}
              className={`meal-block ${getIntensityClass(meal.calories)}`}
              title={`Food: ${meal.food_item}\nCalories: ${
                meal.calories
              } cal\nProtein: ${meal.protein} g\nCarbs: ${meal.carbs} g\nFat: ${
                meal.fat
              } g\nFiber: ${meal.fiber || 0} g`}
            >
              {meal.food_item}
            </div>
          ))
        )}
      </div>
      <span
        className="day-total"
        title={`Total Intake:\nCalories: ${totalCalories} cal\nProtein: ${totalProtein} g\nCarbs: ${totalCarbs} g\nFat: ${totalFat} g\nFiber: ${totalFiber} g`}
      >
        {meals.length} meals
      </span>
    </div>
  );
}

export default function FoodProgress({ initialRange = "week" }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Food");
  const [range, setRange] = useState(initialRange);
  const [foodLogs, setFoodLogs] = useState({});

  const todayStr = new Date().toISOString().split("T")[0];

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
        console.error(err);
      }
    }
    fetchLogs();
  }, []);

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

  const rangeLengths = { today: 1, yesterday: 1, week: 7, month: 30 };
  const length = rangeLengths[range] || 7;

  const data = Array.from({ length }, (_, i) => {
    const d = new Date();
    if (range === "yesterday") d.setDate(d.getDate() - 1);
    else if (range === "week" || range === "month")
      d.setDate(d.getDate() - (length - 1 - i));

    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      label: formatDate(d),
      meals: foodLogs[dateStr] || [],
    };
  });

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
      <Header />
      <h1 className="text-2xl font-bold mb-4">{category} Progress</h1>

      {/* Dropdowns */}
      <div className="filters mb-4 flex gap-4">
        <select
          className="dropdown"
          value={category}
          onChange={(e) => {
            const cat = e.target.value;
            setCategory(cat);
            if (cat === "Water") navigate("/progress/water");
            else if (cat === "Sleep") navigate("/progress/sleep");
            else if (cat === "Exercise") navigate("/progress/exercise");
            else if (cat === "Food") navigate("/progress/food");
          }}
        >
          {["Water", "Sleep", "Exercise", "Food"].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="dropdown"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {["today", "yesterday", "week", "month"].map((r) => (
            <option key={r} value={r}>
              {r === "week" ? "1 Week" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Food grid */}
      <div className={`food-grid ${range === "month" ? "month-view" : ""}`}>
        {data.map((d) => (
          <FoodRow
            key={d.date}
            label={d.label}
            meals={d.meals}
            isToday={d.date === todayStr}
          />
        ))}
      </div>

      <p className="font-bold mt-4">{summary}</p>

      <div className="mt-6">
        <TipBox category="Food" />
      </div>
    </div>
  );
}
