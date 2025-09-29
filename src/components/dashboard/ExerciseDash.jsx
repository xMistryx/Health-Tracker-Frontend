import React from "react";
import useQuery from "../api/useQuery";
import exerciseIcon from "../../assets/images/exercise-icon.png";
import { Link } from "react-router-dom";

export default function ExerciseDash({ date }) {
  const { data, loading, error } = useQuery(
    `/exercise_logs?date=${date}`,
    `exercise-logs-${date}`
  );
  const exerciseLogs =
    data && data.length
      ? data.filter((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : [];

  const totalDuration = exerciseLogs.reduce(
    (sum, log) => sum + Number(log.duration || 0),
    0
  );

  return (
    <Link to="/exercise" className="loglink">
      <div className="exercise-log">
        <img
          src={exerciseIcon}
          alt="Exercise"
          style={{ width: "40px", height: "40px" }}
        />
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : exerciseLogs.length > 0 ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            Activity: {(totalDuration / 60).toFixed(1)} hours
          </span>
        ) : (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            No exercise logged yet
          </span>
        )}
      </div>
    </Link>
  );
}
