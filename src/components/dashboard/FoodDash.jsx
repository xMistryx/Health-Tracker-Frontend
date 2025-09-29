import React from "react";
import useQuery from "../api/useQuery";
import foodIcon from "../../assets/images/food-icon.png";
import { Link } from "react-router-dom";

export default function FoodDash({ date }) {
  const { data, loading, error } = useQuery(
    `/food_logs?date=${date}`,
    `food-logs-${date}`
  );

  const foodLogs =
    data && data.length
      ? data.filter((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : [];

  const totalMeals = foodLogs.length;

  return (
    <Link to="/food" className="loglink">
      <div className="food-log">
        <img src={foodIcon} alt="Food" />
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : totalMeals > 0 ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            Meals: {totalMeals}
          </span>
        ) : (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            No food logged yet
          </span>
        )}
      </div>
    </Link>
  );
}
