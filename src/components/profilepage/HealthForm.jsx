import { useState, useEffect } from "react";
import useMutation from "../api/useMutation";

function HealthForm({ existingData, onSubmit }) {
  const [height, setHeight] = useState(existingData?.height || "");
  const [weight, setWeight] = useState(existingData?.weight || "");
  const [age, setAge] = useState(existingData?.age || "");
  const [biologicalSex, setBiologicalSex] = useState(
    existingData?.biological_sex || existingData?.biologicalSex || ""
  );
  const [gender, setGender] = useState(existingData?.gender || "");

  // Update local state whenever existingData changes
  useEffect(() => {
    setHeight(existingData?.height || "");
    setWeight(existingData?.weight || "");
    setAge(existingData?.age || "");
    setBiologicalSex(
      existingData?.biological_sex || existingData?.biologicalSex || ""
    );
    setGender(existingData?.gender || "");
  }, [existingData]);

  // Use PUT for updates
  const { mutate, loading, error } = useMutation(
    existingData ? "PUT" : "POST",
    existingData ? `/health_info/${existingData.id}` : "/health_info",
    ["healthInfo"]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!height || !weight || !age || !biologicalSex || !gender) {
      alert("Please fill in all fields");
      return;
    }
    if (!existingData?.id) {
      alert("Cannot update: missing record ID");
      return;
    }

    await mutate({
      height,
      weight,
      age,
      biologicalSex,
      gender,
    });

    if (onSubmit) {
      onSubmit({ height, weight, age, biologicalSex, gender });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="ppform"
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
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Intersex">Intersex</option>
        </select>
      </label>
      <label>
        Gender:
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option value="Man">Man</option>
          <option value="Woman">Woman</option>
          <option value="Nonbinary">Nonbinary</option>
          <option value="Genderfluid">Genderfluid</option>
          <option value="Agender">Agender</option>
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : existingData ? "Update" : "Save"}
      </button>
    </form>
  );
}

export default HealthForm;
