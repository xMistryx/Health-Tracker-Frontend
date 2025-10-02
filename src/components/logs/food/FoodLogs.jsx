import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import { Link } from "react-router-dom";
import FoodForm from "./FoodForm";
import TipBox from "../../tip/Tip";
import Encouragement from "../../encouragement/Encouragement";
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
  return (
    <div className={`food-food-row ${isToday ? "today" : ""}`}>
      <span className="food-day-label">{day.getDate()}</span>
      <div className="food-meal-blocks">
        {meals.map((meal, i) => (
          <div
            key={i}
            className={`food-meal-block ${getIntensityClass(i)}`}
            title={`${meal.calories} cal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat, ${meal.fiber}g fiber`}
          >
            {meal.food_item}
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

  // Local logs state
  const [logs, setLogs] = useState(rawFoodLogs || []);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef("");

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Sync query data into local state
  useEffect(() => {
    setLogs(rawFoodLogs || []);
  }, [rawFoodLogs]);

  if (!token) return <p>Please sign in to view your food logs.</p>;
  if (loading) return <p>Loading food logs...</p>;
  if (error)
    return <p className="text-red-500">Error loading food logs: {error}</p>;

  // Fill missing dates
  const fillMissingDates = (logsArray) => {
    const result = [];
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];
      const meals = logsArray.filter(
        (log) => log.date.split("T")[0] === dateStr
      );
      result.push({ day: d, meals });
    }
    return result;
  };

  const days = fillMissingDates(logs);

  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const avgMeals = (totalMeals / days.length).toFixed(1);
  const summary = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Hardcoded encouragements
  const encouragementMessages = {
    "3Meals": "Balanced and fueled! You took great care of yourself today.",
    "5Logs": "That’s a week of food awareness!",
    "10Logs": "Nice! You’re really building healthy habits.",
    "20Logs": "20 logs—your future self is proud!",
  };

  // Handle new food added
  const handleFoodAdded = (newLog) => {
    console.log("Food added:", newLog); // this should show in console
    setToastMessage("Great job! Keep tracking your meals 💪");
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    const mealsToday = updatedLogs.filter(
      (log) => log.date.split("T")[0] === newLog.date.split("T")[0]
    );
    let milestoneKey = null;
    if (mealsToday.length >= 20) milestoneKey = "20Logs";
    else if (mealsToday.length >= 10) milestoneKey = "10Logs";
    else if (mealsToday.length >= 5) milestoneKey = "5Logs";
    else if (mealsToday.length >= 3) milestoneKey = "3Meals";

    if (milestoneKey && lastMilestoneRef.current !== milestoneKey) {
      setToastMessage(encouragementMessages[milestoneKey]);
      lastMilestoneRef.current = milestoneKey;
    }
  };

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

          <FoodForm onAdded={handleFoodAdded} />

          <Encouragement
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

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
