import React from "react";
import useMutation from "../../api/useMutation";
import "./FoodTooltip.css";

const FoodTooltip = ({ meal, isActive, onClose }) => {
  const { mutate } = useMutation("DELETE", "/food_logs/" + meal.id, ["food_logs"]);
  
  if (!isActive) return null;

  return (
    <>
      <div className="tooltip-backdrop" onClick={onClose}></div>
      <div className="custom-tooltip active">
        <strong>{meal.food_item}</strong>
        <br />
        Calories: {meal.calories || "N/A"}
        <br />
        Protein: {meal.protein || "N/A"}g<br />
        Carbs: {meal.carbs || "N/A"}g<br />
        Fat: {meal.fat || "N/A"}g<br />
        Fiber: {meal.fiber || "N/A"}g
        <div className="tooltip-buttons">
          <button className="tooltip-button" onClick={() => mutate()}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default FoodTooltip;
