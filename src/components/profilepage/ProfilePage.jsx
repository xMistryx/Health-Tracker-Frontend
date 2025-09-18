import { useEffect, useState } from "react";
import "./ProfilePage.css";

import HealthForm from "./HealthForm"; // your form component

export default function ProfilePage() {
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token"); // or wherever you store it

  const fetchHealthInfo = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/health_info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please log in.");
      }

      const data = await res.json();
      // If backend returns empty array when no info exists:
      setHealthInfo(data.length ? data[0] : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthInfo();
  }, []);

  const handleFormSubmit = (newInfo) => {
    setHealthInfo(newInfo); // Update after creating/updating
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-container">
      {healthInfo ? (
        <div>
          <h2>Your Health Info</h2>
          <p>Height: {healthInfo.height}</p>
          <p>Weight: {healthInfo.weight}</p>
          <p>Age: {healthInfo.age}</p>
          <p>Biological Sex: {healthInfo.biological_sex}</p>
          <p>Gender: {healthInfo.gender}</p>
          {/* Optional: button to edit */}
          <button onClick={() => setHealthInfo(null)}>Edit Info</button>
        </div>
      ) : (
        <HealthForm token={token} onSubmit={handleFormSubmit} />
      )}
    </div>
  );
}
