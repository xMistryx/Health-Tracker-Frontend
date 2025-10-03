import { useRef } from "react";
import useMutation from "../../api/useMutation";
import "./ExerciseForm.css";

export default function ExerciseForm({ onAdded }) {
  const { mutate, loading, error } = useMutation("POST", "/exercise_logs", [
    "exercise_logs",
  ]);
  const formRef = useRef();

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const handleAddExercise = async (formData) => {
    const newExercise = {
      date: formData.get("date"),
      exercise_type: formData.get("exercise_type"),
      duration: Number(formData.get("duration")),
    };

    const result = await mutate(newExercise);
    console.log("ExerciseForm got result:", result, "error:", error);

    if (!error) {
      formRef.current?.reset();
      if (onAdded) onAdded(result || newExercise); // fallback to newExercise
    }
  };

  return (
    <div className="form-block">
      <p>Add Exercise</p>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddExercise(new FormData(e.target));
        }}
        className="exerciseform"
      >
        <label>
          Date:
          <input type="date" name="date" defaultValue={localToday} required />
        </label>
        <label>
          Type:
          <select name="exercise_type" defaultValue="Stretching">
            <option value="Stretching">Stretching</option>
            <option value="Cardio">Cardio</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Flexibility Training">Flexibility Training</option>
            <option value="Balance Training">Balance Training</option>
          </select>
        </label>
        <label>
          Duration:
          <input type="number" name="duration" placeholder="- - -" required />
        </label>
        <button disabled={loading}>
          {loading ? "Adding..." : "Add Exercise"}
        </button>
        {error && <output>{error}</output>}
      </form>
    </div>
  );
}
