import { useState } from "react";

export default function HealthForm({ token, onSubmit, existingData }) {
  const [height, setHeight] = useState(existingData?.height || "");
  const [weight, setWeight] = useState(existingData?.weight || "");
  const [age, setAge] = useState(existingData?.age || "");
  const [biologicalSex, setBiologicalSex] = useState(
    existingData?.biological_sex || ""
  );
  const [gender, setGender] = useState(existingData?.gender || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!height || !weight || !age || !biologicalSex || !gender) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/health_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ height, weight, age, biologicalSex, gender }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save health info");
      }

      const data = await res.json();
      onSubmit(data); // send saved info to parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <h2>{existingData ? "Edit Health Info" : "Add Health Info"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>
        Height:
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </label>

      <label>
        Weight:
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </label>

      <label>
        Age:
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </label>

      <label>
        Biological Sex:
        <select
          value={biologicalSex}
          onChange={(e) => setBiologicalSex(e.target.value)}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Intersex</option>
        </select>
      </label>

      <label>
        Gender:
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option value="Man">Man</option>
          <option value="Woman">Woman</option>
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : existingData ? "Update" : "Save"}
      </button>
    </form>
  );
}
