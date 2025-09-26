import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import HealthForm from "./HealthForm";
import Header from "../navbar/Header";
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
  const [editing, setEditing] = useState(() => {
    return JSON.parse(localStorage.getItem("editing")) || false;
  });
  const [profileImage, setProfileImage] = useState(girlIcon);

  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [food, setFood] = useState(0);

  const dailyGoals = {
    water: 70,
    sleep: 480,
    exercise: 60,
    food: 2000,
  };

  const today = new Date().toISOString().split("T")[0];

  const handleSignOut = () => {
    if (window.confirm("Do you want to sign out?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHealthInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/health_info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;
        if (res.status === 401) throw new Error("Unauthorized. Please log in.");

        const data = await res.json();

        // If no record exists, initialize with empty fields
        if (isMounted) {
          setHealthInfo(
            data.length
              ? data[0]
              : {
                  first_name: "",
                  last_name: "",
                  height: "",
                  weight: "",
                  age: "",
                  biological_sex: "",
                  gender: "",
                  id: null, // will be null for new record
                }
          );
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchStat = async (url, setter, key) => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch ${key}`);
        const entries = await res.json();
        setter(entries[0]?.[key] || 0);
      } catch (err) {
        console.error(`Error fetching ${key}:`, err);
        setter(0);
      }
    };

    // Fetch all stats
    fetchHealthInfo();
    const stats = [
      {
        url: "http://localhost:3000/api/water",
        setter: setWater,
        key: "total_oz",
      },
      {
        url: "http://localhost:3000/api/sleep",
        setter: setSleep,
        key: "duration",
      },
      {
        url: "http://localhost:3000/api/exercise_logs",
        setter: setExercise,
        key: "duration",
      },
      {
        url: "http://localhost:3000/api/food_logs",
        setter: setFood,
        key: "calories",
      },
    ];
    stats.forEach((stat) => fetchStat(stat.url, stat.setter, stat.key));

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleFormSubmit = (updatedData) => {
    console.log("Profile updated with:", updatedData);
    setHealthInfo((prev) => ({
      ...prev,
      ...updatedData,
      biological_sex: updatedData.biologicalSex || prev.biological_sex,
    }));
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
      <Header />

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
        <div className="username">
          <div>{healthInfo?.first_name || "First"}</div>
          <div>{healthInfo?.last_name || "Last"}</div>
        </div>
      </div>

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

      <div className="stats-column">
        {[
          { icon: waterIcon, value: water, goal: dailyGoals.water, unit: "oz" },
          {
            icon: sleepIcon,
            value: sleep,
            goal: dailyGoals.sleep,
            unit: "min",
          },
          {
            icon: exerciseIcon,
            value: exercise,
            goal: dailyGoals.exercise,
            unit: "min",
          },
          { icon: foodIcon, value: food, goal: dailyGoals.food, unit: "cal" },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-row">
              <img src={stat.icon} alt="" className="stat-icon" />
              <span className="stat-value">
                {stat.value} / {stat.goal} {stat.unit}
              </span>
              <small className="stat-date">{today}</small>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min((stat.value / stat.goal) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <HealthForm
          token={token}
          existingData={healthInfo}
          onSubmit={handleFormSubmit}
        />
      )}

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
          onClick={() => navigate("/progress/water")}
        />
        <img src={manIcon} alt="Sign Out" onClick={handleSignOut} />
      </div>
    </div>
  );
}
