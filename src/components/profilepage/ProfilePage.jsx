import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import HealthForm from "./HealthForm";
import "./ProgressBar.css";

import girlIcon from "../../assets/images/girl.jpg";
import editIcon from "../../assets/images/edit-icon.jpg";
import cameraIcon from "../../assets/images/camera-icon.webp";
import waterIcon from "../../assets/images/water-icon.png";
import sleepIcon from "../../assets/images/sleep.jpg";
import exerciseIcon from "../../assets/images/exercise1.webp";
import foodIcon from "../../assets/images/food-icon.png";
import homeIcon from "../../assets/images/home-icon.jpg";
import manIcon from "../../assets/images/profile-icon.png";
import progressIcon from "../../assets/images/progress-icon.jpg";
import dashboardIcon from "../../assets/images/dashboard-icon.png";
export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(girlIcon);

  // new states for daily totals
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [food, setFood] = useState(0);
  const dailyWaterGoal = 70; // oz
  const dailySleepGoal = 480; // in minutes (8 hours)
  const dailyExerciseGoal = 60; // in minutes
  const dailyFoodGoal = 2000; // in calories

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let isMounted = true;

    async function fetchHealthInfo() {
      try {
        const res = await fetch("http://localhost:3000/api/health_info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;
        if (res.status === 401) throw new Error("Unauthorized. Please log in.");
        const data = await res.json();
        if (isMounted) setHealthInfo(data.length ? data[0] : null);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function fetchWater() {
      try {
        const res = await fetch("http://localhost:3000/api/water", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch water logs");

        const entries = await res.json();
        console.log("Water entries:", entries); // 👀 debug

        const today = new Date().toISOString().split("T")[0];

        setWater(entries[0].total_oz);
      } catch (err) {
        console.error("Error fetching water:", err);
      }
    }
    async function fetchSleep() {
      try {
        const res = await fetch("http://localhost:3000/api/sleep", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const entries = await res.json();
        console.log("Sleep entries:", entries);

        setSleep(entries[0].duration);
      } catch (err) {
        console.error("Error fetching sleep:", err);
      }
    }

    async function fetchExercise() {
      try {
        const res = await fetch("http://localhost:3000/api/exercise_logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const entries = await res.json();
        const total = entries;
        console.log("Exercise entries:", entries);
        setExercise(entries[0].duration);
      } catch (err) {
        console.error("Error fetching exercise:", err);
      }
    }

    async function fetchFood() {
      try {
        const res = await fetch("http://localhost:3000/api/food_logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const entries = await res.json();
        const total = entries;
        console.log("Food entries:", entries);
        setFood(entries[0].calories);
      } catch (err) {
        console.error("Error fetching food:", err);
      }
    }

    fetchHealthInfo();
    fetchWater();
    fetchSleep();
    fetchExercise();
    fetchFood();

    return () => {
      isMounted = false;
    };
  }, [token, today]);

  const handleFormSubmit = (newInfo) => {
    setHealthInfo(newInfo);
    setEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-container">
      {/* Navigation inside container */}
      <div className="nav-desktop">
        <span onClick={() => navigate("/")}>Home</span>

        <span onClick={() => navigate("/dashboard")}>Dashboard</span>
        <span onClick={() => navigate("/progress")}>Progress</span>
        <span
          onClick={() => {
            if (window.confirm("Do you want to sign out?")) {
              localStorage.removeItem("token");
              navigate("/");
            }
          }}
        >
          Sign Out
        </span>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper">
          <img src={profileImage} alt="Profile" className="profile-image" />
          {editing ? (
            <label className="camera-icon">
              <img src={cameraIcon} alt="Change" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          ) : (
            <img
              src={editIcon}
              alt="Edit"
              className="edit-icon"
              onClick={() => setEditing(true)}
            />
          )}
        </div>

        {/* Name */}
        <div className="username">
          <div>{healthInfo?.first_name || "First"}</div>
          <div>{healthInfo?.last_name || "Last"}</div>
        </div>
      </div>

      {/* Age/Height/Weight */}
      <div className="profile-stats-table">
        <div className="labels-row">
          <span>Age</span>
          <span>Height</span>
          <span>Weight</span>
        </div>
        <div className="values-row">
          <span>{healthInfo?.age || "-"}</span>
          <span>{healthInfo?.height || "-"} cm</span>
          <span>{healthInfo?.weight || "-"} kg</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-column">
        <div className="stat-card">
          {/* First row: icon, value, date */}
          <div className="stat-row">
            <img src={waterIcon} alt="Water" className="stat-icon" />
            <span className="stat-value">
              {water}/{dailyWaterGoal} oz
            </span>
            <small className="stat-date">{today}</small>
          </div>

          {/* Second row: progress bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min((water / dailyWaterGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-row">
            <img src={sleepIcon} alt="Sleep" className="stat-icon" />
            <span className="stat-value">
              {sleep} / {dailySleepGoal} min
            </span>
            <small className="stat-date">{today}</small>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min((sleep / dailySleepGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-row">
            <img src={exerciseIcon} alt="Exercise" className="stat-icon" />
            <span className="stat-value">
              {exercise} / {dailyExerciseGoal} min
            </span>
            <small className="stat-date">{today}</small>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(
                  (exercise / dailyExerciseGoal) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-row">
            <img src={foodIcon} alt="Food" className="stat-icon" />
            <span className="stat-value">
              {food} / {dailyFoodGoal} cal
            </span>
            <small className="stat-date">{today}</small>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min((food / dailyFoodGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Health Form */}
      {editing && (
        <HealthForm
          token={token}
          existingData={healthInfo}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Mobile Nav */}
      <div className="nav-mobile">
        <img src={homeIcon} alt="Home" onClick={() => navigate("/")} />
        <img
          src={dashboardIcon}
          alt="Dashboard"
          onClick={() => navigate("/dashboard")}
        />
        <img
          src={progressIcon}
          alt="Progress"
          onClick={() => navigate("/progress")}
        />
        <img
          src={manIcon}
          alt="Sign Out"
          onClick={() => {
            if (window.confirm("Do you want to sign out?")) {
              localStorage.removeItem("token");
              navigate("/");
            }
          }}
        />
      </div>
    </div>
  );
}
