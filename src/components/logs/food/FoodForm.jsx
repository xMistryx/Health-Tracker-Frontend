import { useRef } from "react";
import useMutation from "../../api/useMutation";
import "./FoodForm.css";

export default function FoodForm() {
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

  const AddFood = async (formData) => {
    const date = formData.get("date");
    const food_item = formData.get("food_item");
    const calories = formData.get("calories");
    const protein = formData.get("protein");
    const carbs = formData.get("carbs");
    const fat = formData.get("fat");
    const fiber = formData.get("fiber");

    const result = await mutate({
      date,
      food_item,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      fiber: Number(fiber),
    });

    if (result && !error) {
      formRef.current?.reset();
    }
  };

  return (
    <div className="form-block">
      <p>Add Food</p>
      <form ref={formRef} action={AddFood} className="foodform">
        <div className="food-form-row">
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
            Food Item:
            <input
              type="text"
              name="food_item"
              placeholder="Food"
              className="foodinput"
              required
            />
          </label>
          <label>
            Calories:
            <input type="number" name="calories" min="0" placeholder="- - -" className="foodinput" />
          </label>
          <label>
            Protein (g):
            <input
              type="number"
              name="protein"
              min="0"
              placeholder="- - -"
              className="foodinput"
            />
          </label>
        </div>
        <div className="food-form-row">
          <label>
            Carbs (g):
            <input
              type="number"
              name="carbs"
              min="0"
              placeholder="- - -"
              className="foodinput"
            />
          </label>
          <label>
            Fat (g):
            <input
              type="number"
              name="fat"
              min="0"
              placeholder="- - -"
              className="foodinput"
            />
          </label>
          <label>
            Fiber (g):
            <input
              type="number"
              name="fiber"
              min="0"
              placeholder="- - -"
              className="foodinput"
            />
          </label>
        </div>
        <button disabled={loading} className="formbutton">
          {loading ? "Adding..." : "Add Food"}
        </button>
        {error && <output>{error}</output>}
      </form>
    </div>
  );
}
