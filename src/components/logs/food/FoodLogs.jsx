import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import { Link } from "react-router-dom";
import FoodForm from "./FoodForm";
import TipBox from "../../tip/Tip";
import FoodTooltip from "./FoodTooltip";
import "./FoodLogs.css";

const getIntensityClass = (mealIndex) => {
  if (mealIndex === 0) return "intensity-1";
  if (mealIndex === 1) return "intensity-2";
  if (mealIndex === 2) return "intensity-3";
  if (mealIndex === 3) return "intensity-4";
  if (mealIndex === 4) return "intensity-5";
  return "intensity-6";
};

function FoodRow({ day, meals, isToday }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div className={`food-food-row ${isToday ? "today" : ""}`}>
      <span className="food-day-label">{day.getDate()}</span>
      <div className="food-meal-blocks">
        {meals.map((meal, i) => (
          <div
            key={i}
            className={`food-meal-block ${getIntensityClass(i)}`}
            onClick={() => setActiveTooltip(activeTooltip === i ? null : i)}
          >
            <span className="meal-content">{meal.food_item}</span>
            <FoodTooltip
              meal={meal}
              isActive={activeTooltip === i}
              onClose={() => setActiveTooltip(null)}
            />
          </div>
        ))}
      </div>
      <span className="food-day-total">{meals.length} meals</span>
    </div>
  );
}

export default function FoodLogs() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    data: rawFoodLogs,
    loading,
    error,
  } = useQuery("/food_logs", "food_logs");

  const foodLogs = rawFoodLogs || [];

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  if (!token) {
    return (
      <div className="food-page-container">
        <h1 className="text-2xl font-bold mb-6">Food Log</h1>
        <p>Please sign in to view your food logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="food-page-container">
        <h1 className="text-2xl font-bold mb-6">Food Log</h1>
        <p>Loading food logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="food-page-container">
        <h1 className="text-2xl font-bold mb-6">Food Logs</h1>
        <p className="text-red-500">Error loading food logs: {error}</p>
      </div>
    );
  }

  function fillMissingDates(logs) {
    const result = [];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];

      const meals = logs
        .filter(
          (log) => new Date(log.date).toISOString().split("T")[0] === dateStr
        )
        .sort((a, b) => a.id - b.id);

      result.push({ day: d, meals });
    }

    return result;
  }

  const days = fillMissingDates(foodLogs);

  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const avgMeals = (totalMeals / days.length).toFixed(1);

  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const summary = `${currentMonthName}`;

  return (
    <div className="food-page-container">
      <h1 className="text-2xl font-bold mb-6">Food Log</h1>
      <div className="food-progress-container">
        <div className="food-left-column">
          <button onClick={() => navigate("/dashboard")} className="food-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{summary}</p>
        </div>

        <div className="food-right-column">
          <div className="food-grid">
            {days.map((d, idx) => (
              <FoodRow
                key={idx}
                day={d.day}
                meals={d.meals}
                isToday={d.day.toISOString().split("T")[0] === todayStr}
              />
            ))}
          </div>
          <Link to="/recipes" className="food-recipes-link">
            Not sure what to eat?
          </Link>
          <FoodForm />
          <div className="foodinfo">
            <p>
              <strong>Total:</strong> {totalMeals} meals
            </p>
            <p>
              <strong>Average:</strong> {avgMeals} meals per day
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <TipBox category={["Food & Nourishment", "Electrolytes"]} />
      </div>
    </div>
  );
}
