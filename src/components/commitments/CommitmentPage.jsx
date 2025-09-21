import React, { useEffect, useMemo, useState } from "react";
import "./CommitmentPage.css";

const CATEGORY_PALETTES = {
  water: { base: "#6FA49C", dark: "#4E8B7F" },
  sleep: { base: "#6FA49C", dark: "#4E8B7F" },
  exercise: { base: "#A8C3A0", dark: "#86A682" },
  food: { base: "#D9A48F", dark: "#C4866F" },
};

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

export default function CommitmentPage() {
  const today = new Date();
  const year = today.getFullYear();
  const [category, setCategory] = useState("water");
  const [dataMap, setDataMap] = useState({}); // { 'YYYY-MM-DD': { logged: bool, goalMet: bool } }
  const [loading, setLoading] = useState(false);

  const palette = CATEGORY_PALETTES[category] || CATEGORY_PALETTES.water;

  useEffect(() => {
    async function fetchYearData() {
      setLoading(true);
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Example query: /api/water?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
        const res = await fetch(
          `http://localhost:3000/${category}?start_date=${startDate}&end_date=${endDate}`,
          { headers }
        );

        const json = res.ok ? await res.json() : [];

        // Normalize: expect array of logs or aggregated objects per date.
        // We'll create a map of date -> { logged: true/false, goalMet: true/false }
        const map = {};
        // If backend returns aggregated per-day entries with a `date` and `achieved` or `goal_met`, use that.
        if (Array.isArray(json)) {
          json.forEach((item) => {
            const d = item.date || item.day || item.logged_date;
            if (!d) return;
            // heuristics
            const logged = true;
            const goalMet = !!(item.goal_met || item.achieved || item.goalAchieved || item.met);
            map[d] = { logged, goalMet };
          });
        }

        setDataMap(map);
      } catch (err) {
        console.error("Failed to fetch commitments:", err);
        setDataMap({});
      } finally {
        setLoading(false);
      }
    }

    fetchYearData();
  }, [category, year]);

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

  return (
    <div className="commitment-page">
      <h2>Yearly Commitments — {year}</h2>

      <div className="controls">
        <label>
          Category:{" "}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
            <div className="month-label">{new Date(year, mRow.month, 1).toLocaleString(undefined, { month: "short" })}</div>
            <div className="month-days">
              {mRow.days.map((d, di) => {
                const dayKey = formatDate(d);
                const status = dataMap[dayKey];
                const cls = status ? (status.goalMet ? "goal-met" : "logged") : "empty";
                const style = status
                  ? { backgroundColor: status.goalMet ? palette.dark : palette.base }
                  : {};

                return (
                  <div
                    key={di}
                    title={dayKey + (status ? (status.goalMet ? " — goal met" : " — logged") : "")}
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
