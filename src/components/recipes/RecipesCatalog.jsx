import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecipeList from "./RecipeList";
import SearchBar from "./SearchBar";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/ApiContext";
import "./RecipesCatalog.css";

export default function RecipesCatalog() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  const { token } = useAuth();

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch(`${API}/recipes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // try parse JSON but handle non-JSON responses (like plain 'Unauthorized')
        let data;
        try {
          data = await res.json();
        } catch {
          const text = await res.text();
          throw new Error(text || 'Failed to parse recipes response');
        }

        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Failed to fetch recipes');
        }

        setRecipes(data);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setRecipes([]);
      }
    }
    fetchRecipes();
  }, [token]);

  const handleSearch = (query) => {
    console.log(query);
    if (!query) {
      setFilteredRecipes(recipes);
      return;
    }
    const results = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecipes(results);
  };
  // default to all recipes if no search performed
  const shown = filteredRecipes.length ? filteredRecipes : recipes;

  return (
    <div className="recipes-catalog">
      <div className="catalog-header">
        <h1> Recipes Catalog</h1>
  <Link to="/recipes/new" className="create-recipe-link">Add a recipe</Link>
      </div>
      <SearchBar onSearch={handleSearch} />
      <RecipeList recipes={shown} />
    </div>
  );
}