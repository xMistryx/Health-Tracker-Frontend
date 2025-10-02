import { useState } from "react";
import "./ProfilePage.css";
import HealthForm from "./HealthForm";
import useQuery from "../api/useQuery";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { data, loading, error } = useQuery("/health_info", "healthInfo");
  const healthInfo = data && data.length ? data[0] : null;
  const [editing, setEditing] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-container">
      {healthInfo && !editing ? (
        <div>
          <h2>{healthInfo.username}</h2>
          <h3>Health Info</h3>
          <p>Height: {healthInfo.height} in</p>
          <p>Weight: {healthInfo.weight} lbs</p>
          <p>Age: {healthInfo.age}</p>
          <p>Biological Sex: {healthInfo.biological_sex}</p>
          <p>Gender: {healthInfo.gender}</p>
          <div className="profile-buttons">
            <button onClick={() => setEditing(true)}>Edit Info</button>
            <button onClick={handleLogout}>Log out</button>
          </div>
        </div>
      ) : (
        <HealthForm
          onSubmit={() => setEditing(false)}
          existingData={healthInfo}
        />
      )}
    </div>
  );
}
