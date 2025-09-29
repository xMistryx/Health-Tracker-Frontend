import { Link } from "react-router-dom";

export default function RecipeList({ recipes }) {
  return (
    <ul>
      {recipes.map((recipe) => (
        <li key={recipe.id} id="recipe-list">
          <Link to={"/recipes/" + recipe.id}>
            <h1 className="recipe-title">
              {recipe.title}
            </h1>
            <div >
              <figure>
                <img className="img-div" src={recipe.image_url} alt={`img of ${recipe.title}`} />
              </figure>
            </div>
            <div>
            <h4 style={{ color: "#4f6b57", fontSize: "1.3em" }}>by {recipe.created_by}</h4>{" "}
            {/* should be the creator username */}
            <p style={{ color: "#555", fontSize: "1em" }}>{recipe.description}</p>
          </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
