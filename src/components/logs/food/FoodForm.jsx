import { useRef } from "react";
import useMutation from "../../api/useMutation";
import "./FoodForm.css";

export default function FoodForm({ onAdded }) {
  const { mutate, loading, error } = useMutation("POST", "/food_logs", [
    "food_logs",
  ]);
  const formRef = useRef();

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const handleAddFood = async (formData) => {
    const newLog = {
      date: formData.get("date"),
      food_item: formData.get("food_item"),
      calories: Number(formData.get("calories")) || 0,
      protein: Number(formData.get("protein")) || 0,
      carbs: Number(formData.get("carbs")) || 0,
      fat: Number(formData.get("fat")) || 0,
      fiber: Number(formData.get("fiber")) || 0,
    };

    const result = await mutate(newLog);
    console.log("FoodForm got result:", result, "error:", error);

    if (!error) {
      formRef.current?.reset();
      if (onAdded) onAdded(result || newLog); // fallback to newLog
    }
  };

  return (
    <div className="form-block">
      <p>Add Food</p>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddFood(new FormData(e.target));
        }}
        className="foodform"
      >
        <div className="food-form-row">
          <label>
            Date:
            <input type="date" name="date" defaultValue={localToday} required />
          </label>
          <label>
            Food Item:
            <input type="text" name="food_item" placeholder="Food" required />
          </label>
          <label>
            Calories:
            <input type="number" name="calories" min="0" placeholder="- - -" />
          </label>
          <label>
            Protein (g):
            <input type="number" name="protein" min="0" placeholder="- - -" />
          </label>
        </div>
        <div className="food-form-row">
          <label>
            Carbs (g):
            <input type="number" name="carbs" min="0" placeholder="- - -" />
          </label>
          <label>
            Fat (g):
            <input type="number" name="fat" min="0" placeholder="- - -" />
          </label>
          <label>
            Fiber (g):
            <input type="number" name="fiber" min="0" placeholder="- - -" />
          </label>
        </div>
        <button disabled={loading}>{loading ? "Adding..." : "Add Food"}</button>
        {error && <output>{error}</output>}
      </form>
    </div>
  );
}
