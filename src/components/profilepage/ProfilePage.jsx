import { useState } from "react";
import "./ProfilePage.css";
import HealthForm from "./HealthForm";
import useQuery from "../api/useQuery";

export default function ProfilePage() {
  const { data, loading, error } = useQuery("/health_info", "healthInfo");
  const healthInfo = data && data.length ? data[0] : null;
  const [editing, setEditing] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-container">
      {healthInfo && !editing ? (
        <div>
          <h2>Your Health Info</h2>
          <p>Height: {healthInfo.height}</p>
          <p>Weight: {healthInfo.weight}</p>
          <p>Age: {healthInfo.age}</p>
          <p>Biological Sex: {healthInfo.biological_sex}</p>
          <p>Gender: {healthInfo.gender}</p>
          <button onClick={() => setEditing(true)}>Edit Info</button>
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
