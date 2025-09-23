import React from "react";
import useQuery from "../api/useQuery";
import exerciseIcon from "../../assets/images/fitness-icon.jpg";
import { Link } from "react-router-dom";

export default function ExerciseDash({ date }) {
  const { data, loading, error } = useQuery(
    `/exercise_logs?date=${date}`,
    `exercise-logs-${date}`
  );
  const log =
    data && data.length
      ? data.find((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : null;

  return (
    <Link to="/exercise" className="loglink">
      <div className="exercise-log">
        <img
          src={exerciseIcon}
          alt="Exercise"
          style={{ width: "40px", height: "40px", marginRight: "10px" }}
        />
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : log ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            {log.exercise_type}: {log.duration} minutes
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
