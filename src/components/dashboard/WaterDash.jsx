import React from "react";
import useQuery from "../api/useQuery";
import waterIcon from "../../assets/images/water-icon.png";
import { Link } from "react-router-dom";

export default function WaterDash({ date }) {
  const { data, loading, error } = useQuery(
    `/water_logs?date=${date}`,
    `water-logs-${date}`
  );

  const log =
    data && data.length
      ? data.find((item) => {
          const logDate = new Date(item.date).toISOString().split("T")[0];
          return logDate === date;
        })
      : null;

  return (
    <Link to="/water" className="loglink">
      <div className="water-log">
        <img src={waterIcon} alt="Water" />
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : log ? (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            Water: {log.total_oz} oz
          </span>
        ) : (
          <span style={{ fontSize: "1.2em", marginLeft: 8 }}>
            No water logged yet
          </span>
        )}
      </div>
    </Link>
  );
}
