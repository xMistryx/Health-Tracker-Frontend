import React from "react";
import useQuery from "../api/useQuery";
import sleepIcon from "../../assets/images/sleep-icon.png";
import { Link } from "react-router-dom";

export default function SleepDash({ date }) {
  const { data, loading, error } = useQuery(
    `/sleep_logs?date=${date}`,
    `sleep-logs-${date}`
  );
  const sleepLogs =
    data && data.length
      ? data.filter((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : [];

  const totalDuration = sleepLogs.reduce(
    (sum, log) => sum + Number(log.duration || 0),
    0
  );

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
        ) : sleepLogs.length > 0 ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            Sleep: {(totalDuration / 60).toFixed(1)} hours
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
