import { useRef } from "react";
import useMutation from "../../api/useMutation";
import "./ExerciseForm.css";

export default function ExerciseForm() {
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

  const AddExercise = async (formData) => {
    const date = formData.get("date");
    const exercise_type = formData.get("exercise_type");
    const duration = formData.get("duration");

    const result = await mutate({
      date,
      exercise_type,
      duration,
    });

    if (result && !error) {
      formRef.current?.reset();
    }
  };

  return (
    <div className="form-block">
      <p>Add Exercise</p>
      <form ref={formRef} action={AddExercise} className="exerciseform">
        <label>
          Date:
          <input
            type="date"
            name="date"
            defaultValue={localToday}
            className="dateinput"
            required
          />
        </label>
        <label>
          Type:
          <select
            name="exercise_type"
            defaultValue="Stretching"
            className="exerciseselect"
          >
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
        <button disabled={loading} className="formbutton">
          {loading ? "Adding..." : "Add Exercise"}
        </button>
        {error && <output>{error}</output>}
      </form>
    </div>
  );
}
