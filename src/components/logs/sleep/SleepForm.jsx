import { useRef } from "react";
import useMutation from "../../api/useMutation";
import "./SleepForm.css";

export default function SleepForm({ onAdded }) {
  const { mutate, loading, error } = useMutation("POST", "/sleep_logs", [
    "sleep_logs",
  ]);
  const formRef = useRef();

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return Math.round((end - start) / (1000 * 60)); // minutes
  };

  const handleAddSleep = async (formData) => {
    const date = formData.get("date");
    let sleep_type = formData.get("sleep_type");
    const start_time = formData.get("start_time");
    const end_time = formData.get("end_time");
    const duration = calculateDuration(start_time, end_time);

    // Auto-classify short sleeps < 6h as Nap
    if (sleep_type === "Sleep" && duration < 360) {
      sleep_type = "Nap";
    }

    const newSleepLog = { date, sleep_type, start_time, end_time, duration };

    try {
      const result = await mutate(newSleepLog);
      onAdded?.(result || newSleepLog);
      formRef.current?.reset();
    } catch (err) {
      console.error("Failed to add sleep:", err);
    }
  };

  return (
    <div className="form-block">
      <p>Add Sleep</p>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSleep(new FormData(e.target));
        }}
        className="sleepform"
      >
        <div className="form-row">
          <label>
            Date:
            <input type="date" name="date" defaultValue={localToday} required />
          </label>
          <label>
            Type:
            <select name="sleep_type" defaultValue="Sleep">
              <option value="Sleep">Sleep</option>
              <option value="Nap">Nap</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Start Time:
            <input type="time" name="start_time" required />
          </label>
          <label>
            End Time:
            <input type="time" name="end_time" required />
          </label>
        </div>

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Sleep"}
        </button>
        {error && <output>{error}</output>}
      </form>
    </div>
  );
}
