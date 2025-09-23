import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import useQuery from "../api/useQuery";
import "./CommitmentPage.css";

const CATEGORY_PALETTES = {
  water: { base: "#83b3b8ff", dark: "#83b3b8ff" },
  sleep: { base: "#6FA49C", dark: "#4E8B7F" },
  exercise: { base: "#A8C3A0", dark: "#86A682" },
  food: { base: "#D9A48F", dark: "#C4866F" },
};

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

export default function CommitmentPage() {
  const { token } = useAuth();
  const today = new Date();
  const year = today.getFullYear();
  const [category, setCategory] = useState("water");

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const queryKey = `${category}-commitments-${year}`;

  const endpointMap = {
    water: "water_logs",
    sleep: "sleep_logs",
    exercise: "exercise_logs",
    food: "food_logs",
  };

  const endpoint = endpointMap[category] || "water_logs";

  const {
    data: json,
    loading,
    error,
  } = useQuery(
    `/${endpoint}?start_date=${startDate}&end_date=${endDate}`,
    queryKey
  );

  const dataMap = useMemo(() => {
    if (!json || !Array.isArray(json)) return {};

    const map = {};
    json.forEach((item) => {
      const d = item.date || item.day || item.logged_date;
      if (!d) return;

      // Clean up date format if it has time
      const cleanDate = d.includes("T") ? d.split("T")[0] : d;

      const logged = true;
      const goalMet = !!(
        item.goal_met ||
        item.achieved ||
        item.goalAchieved ||
        item.met
      );
      map[cleanDate] = { logged, goalMet };
    });
    return map;
  }, [json]);

  // Generate day grid grouped by month rows
  const months = useMemo(() => {
    const rows = [];
    for (let m = 0; m < 12; m++) {
      const days = new Date(year, m + 1, 0).getDate();
      const row = [];
      for (let d = 1; d <= days; d++) {
        const date = new Date(year, m, d);
        row.push(date);
      }
      rows.push({ month: m, days: row });
    }
    return rows;
  }, [year]);

  const palette = CATEGORY_PALETTES[category] || CATEGORY_PALETTES.water;

  // Show loading or error states
  if (!token) {
    return (
      <div className="commitment-page">
        Please sign in to view your commitments.
      </div>
    );
  }

  if (error) {
    return (
      <div className="commitment-page">Error loading commitments: {error}</div>
    );
  }

  return (
    <div className="commitment-page">
      <h2>Yearly Commitments — {year}</h2>

      <div className="controls">
        <label className="commit-label">
          Category:{" "}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="commit-select"
          >
            <option value="water">Water</option>
            <option value="sleep">Sleep</option>
            <option value="exercise">Exercise</option>
            <option value="food">Food</option>
          </select>
        </label>
        {loading && <span className="loading">Loading…</span>}
      </div>

      <div className="year-grid">
        {months.map((mRow, mi) => (
          <div className="month-row" key={mi}>
            <div className="month-label">
              {new Date(year, mRow.month, 1).toLocaleString(undefined, {
                month: "short",
              })}
            </div>
            <div className="month-days">
              {mRow.days.map((d, di) => {
                const dayKey = formatDate(d);
                const status = dataMap[dayKey];
                const cls = status
                  ? status.goalMet
                    ? "goal-met"
                    : "logged"
                  : "empty";
                const style = status
                  ? {
                      backgroundColor: status.goalMet
                        ? palette.dark
                        : palette.base,
                    }
                  : {};

                return (
                  <div
                    key={di}
                    title={
                      dayKey +
                      (status
                        ? status.goalMet
                          ? " — goal met"
                          : " — logged"
                        : "")
                    }
                    className={`day-block ${cls}`}
                    style={style}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
