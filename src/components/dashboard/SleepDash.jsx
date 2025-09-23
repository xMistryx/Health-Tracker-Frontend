import React from "react";
import useQuery from "../api/useQuery";
import sleepIcon from "../../assets/images/sleep-icon.jpg";
import { Link } from "react-router-dom";

export default function SleepDash({ date }) {
  const { data, loading, error } = useQuery(
    `/sleep_logs?date=${date}`,
    `sleep-logs-${date}`
  );
  const log =
    data && data.length
      ? data.find((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : null;

  return (
    <Link to="/sleep" className="loglink">
      <div className="sleep-log">
        <img
          src={sleepIcon}
          alt="Sleep"
          style={{ width: "40px", height: "40px" }}
        />
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : log ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            {log.sleep_type}: {log.duration} hours
          </span>
        ) : (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            No sleep logged yet
          </span>
        )}
      </div>
    </Link>
  );
}
