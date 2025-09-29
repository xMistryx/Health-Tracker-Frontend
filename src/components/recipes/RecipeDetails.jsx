import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API } from "../../components/api/ApiContext";
import { useAuth } from "../../components/auth/AuthContext";
import "./RecipeDetails.css";

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/recipes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Recipe not found");
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        setError(err.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchRecipe();
  }, [id, token]);

  const handleEdit = () => {
    // route to an edit page (not implemented here)
    navigate(`/recipes/${id}/edit`);
  };

  // decode a JWT payload without external libs to read user id from token
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
      return null;
    }
  }

  // helper to determine if current user is the creator (compare user_id)
  const isCreator = (() => {
    if (!recipe) return false;
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    // server sets user_id on recipe; compare numeric ids
    const tokenUserId = payload.id ?? payload.userId ?? payload.user_id;
    if (!tokenUserId) return false;
    return Number(tokenUserId) === Number(recipe.user_id);
  })();

  const handleDelete = async () => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/recipes/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete recipe');
      }
      // on success, go back to catalog
      navigate("/recipes");
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  if (loading) return <div>Loading recipe…</div>;
  if (error) return <div className="error">{error}</div>;
  const successMsg = location.state?.success;
  if (!recipe) return <div>No recipe found.</div>;

  // render ingredients (stored as JSONB on backend)
  let ingredientsList = [];
  try {
    if (Array.isArray(recipe.ingredients)) ingredientsList = recipe.ingredients;
    else if (typeof recipe.ingredients === "string") ingredientsList = JSON.parse(recipe.ingredients);
  } catch {
    ingredientsList = [];
  }

  return (
    <div className="recipe-details" style={{ padding: 18 }}>
      {successMsg && <div style={{ background: '#e6ffed', border: '1px solid #b7f5c9', padding: 8, marginBottom: 12 }}>{successMsg}</div>}
      <h2>{recipe.title}</h2>
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.title} style={{ maxWidth: 400, width: "100%", height: "auto" }} />
      )}
      <p>{recipe.description}</p>

      <h3>Ingredients</h3>
      {ingredientsList.length ? (
        <ul>
          {ingredientsList.map((ing, i) => (
            <li key={i}>{typeof ing === "string" ? ing : JSON.stringify(ing)}</li>
          ))}
        </ul>
      ) : (
        <p>No ingredients listed.</p>
      )}

      <h3>Instructions</h3>
      <div style={{ whiteSpace: "pre-wrap" }}>{recipe.instructions}</div>

      <p>
        <strong>Added by:</strong> {recipe.created_by}
      </p>
      <p className="times">
        <strong>Created at:</strong> {formatTimestamp(recipe.created_at)}
      </p>
      <p className="times">
        <strong>Last updated:</strong> {formatTimestamp(recipe.updated_at)}
      </p>

      {isCreator && (
        <div className="actions">
          <button onClick={handleEdit}>Edit recipe</button>
          <button onClick={handleDelete} style={{ background: '#e55353', color: 'white' }}>Delete</button>
        </div>
      )}
    </div>
  );
}
