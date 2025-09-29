import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../components/api/ApiContext";
import { useAuth } from "../../components/auth/AuthContext";

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    // ignore parse errors
    return null;
  }
}

export default function RecipeForm() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id } = useParams();
  // const location = useLocation();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [instructionText, setInstructionText] = useState("");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // determine created_by username from localStorage.user or token payload
  const [createdBy, setCreatedBy] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored).username || "";
      // fallback: try decode token payload for username/email
      const savedToken = localStorage.getItem("token");
      const payload = decodeJwtPayload(savedToken);
      // common payload fields: username, sub, email, user?.username
      return payload?.username || payload?.email || (payload?.user && payload.user.username) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    async function load() {
      if (!isEdit) return;
      try {
        const res = await fetch(`${API}/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Recipe not found');
        const data = await res.json();
        setTitle(data.title || '');
        setImageUrl(data.image_url || '');
        setDescription(data.description || '');
        setInstructionText(data.instructions || '');
        setIngredients(Array.isArray(data.ingredients) ? data.ingredients : (typeof data.ingredients === 'string' ? JSON.parse(data.ingredients) : []));
      } catch (err) {
        // loading error
        setError(err.message || 'Failed to load recipe');
      }
    }
    load();
  }, [id, isEdit, token]);

  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (!val) return;
    setIngredients((s) => [...s, val]);
    setIngredientInput("");
  };

  const removeIngredient = (i) => {
    setIngredients((s) => s.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !instructionText) {
      setError("Please fill title, description and instructions.");
      return;
    }
       if (!createdBy || !createdBy.trim()) {
     setError("Please provide a username in the Created By field.");
     return;
   }

    const payload = {
      title,
      image_url: imageUrl || null,
      description,
      ingredients,
      instructions: instructionText,
      created_by: createdBy.trim(),
    };

    try {
      setLoading(true);
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API}/recipes/${id}` : `${API}/recipes`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || (isEdit ? "Update failed" : "Create failed"));
  // navigate to recipe details and show success message via state
  navigate(`/recipes/${data.id}`, { state: { success: isEdit ? 'Recipe updated' : 'Recipe created' } });
    } catch (err) {
      setError(err.message || "Failed to create/update recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form" style={{ padding: 18 }}>
      <h2>Create recipe</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Image URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <label>Ingredients</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="e.g. 1 cup flour"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
            />
            <button type="button" onClick={addIngredient}>
              Add
            </button>
          </div>
          <ul>
            {ingredients.map((ing, i) => (
              <li key={i}>
                {ing} <button type="button" onClick={() => removeIngredient(i)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label>Instructions</label>
          <textarea value={instructionText} onChange={(e) => setInstructionText(e.target.value)} required />
        </div>

        <div>
                 <label>
        Created by (username)
        <input
         type="text"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder="Your username"
          required
        />
      </label>
      </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create recipe"}</button>
          <button type="button" onClick={() => navigate('/recipes')} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
