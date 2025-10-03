import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import FoodForm from "./FoodForm";
import TipBox from "../../tip/Tip";
import FoodTooltip from "./FoodTooltip";
import Encouragement from "../../encouragement/Encouragement";
import "./FoodLogs.css";

// Get CSS intensity class for visual blocks
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

  // --- Fetch food logs & db encouragements ---
  const {
    data: rawFoodLogs = [],
    loading,
    error,
  } = useQuery("/food_logs", "food_logs");

  const { data: dbEncouragements = [] } = useQuery(
    "/encouragements?category=Food",
    "encouragements"
  );

  const [foodLogs, setFoodLogs] = useState([]);
  const [encouragementMsg, setEncouragementMsg] = useState("");
  const triggeredMilestonesRef = useRef(new Set());

  useEffect(() => {
    setFoodLogs(rawFoodLogs || []);
  }, [rawFoodLogs]);

  // --- Local-only encouragements ---
  const localFoodEncouragements = [
    {
      milestone: "FirstMeal",
      message: "Great start! Your first meal sets the tone for the day.",
    },
    {
      milestone: "SecondMeal",
      message: "Two meals logged—you’re staying mindful!",
    },
  ];

  const allFoodEncouragements = [
    ...dbEncouragements,
    ...localFoodEncouragements,
  ];

  // --- Handle food added ---
  const handleFoodAdded = (newLog) => {
    const updatedLogs = [...foodLogs, newLog];
    setFoodLogs(updatedLogs);

    // Count meals for the date of the new log
    const dateStr = newLog.date.split("T")[0];
    const todaysLogs = updatedLogs.filter(
      (log) => log.date.split("T")[0] === dateStr
    );
    const logsCount = todaysLogs.length; // only today

    let milestoneKey = null;

    // Local milestones for first and second meal of the day
    if (logsCount === 1) milestoneKey = "FirstMeal";
    else if (logsCount === 2) milestoneKey = "SecondMeal";
    else if (logsCount === 3) milestoneKey = "3Meals";

    // DB milestones based on cumulative logs
    const totalLogs = updatedLogs.length;
    if (totalLogs === 5) milestoneKey = "5Logs";
    else if (totalLogs === 10) milestoneKey = "10Logs";
    else if (totalLogs === 20) milestoneKey = "20Logs";

    if (!milestoneKey || triggeredMilestonesRef.current.has(milestoneKey))
      return;

    const milestoneEncouragement = allFoodEncouragements.find(
      (e) => e.milestone === milestoneKey
    );

    if (milestoneEncouragement) {
      setEncouragementMsg(milestoneEncouragement.message);
      triggeredMilestonesRef.current.add(milestoneKey);
    }
  };

  // --- Fill missing dates with meals ---
  const fillMissingDates = (logs) => {
    const result = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];

      const meals = logs
        .filter((log) => log.date.split("T")[0] === dateStr)
        .sort((a, b) => a.id - b.id);

      result.push({ day: d, meals });
    }
    return result;
  };

  const days = fillMissingDates(foodLogs);

  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const avgMeals = (totalMeals / days.length).toFixed(1);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!token) return <p>Please sign in to view your food logs.</p>;
  if (loading) return <p>Loading food logs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="food-page-container">
      <h1 className="text-2xl font-bold mb-6">Food Log</h1>
      <div className="food-progress-container">
        <div className="food-left-column">
          <button onClick={() => navigate("/dashboard")} className="food-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{currentMonthName}</p>
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

      {encouragementMsg && (
        <Encouragement
          message={encouragementMsg}
          onClose={() => setEncouragementMsg("")}
        />
      )}

      <div className="mt-6">
        <TipBox category={["Food & Nourishment", "Electrolytes"]} />
      </div>
    </div>
  );
}
