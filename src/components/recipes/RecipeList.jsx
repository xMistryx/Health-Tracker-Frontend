import { Link } from "react-router-dom";

export default function RecipeList({ recipes }) {
  return (
    <ul>
      {recipes.map((recipe) => (
        <Link to={"/recipes/" + recipe.id} className="reclink">
          <li key={recipe.id} id="recipe-list">
              <h1 className="recipe-title">
                {recipe.title}
              </h1>
              <div >
                <figure>
                  <img className="img-div" src={recipe.image_url} alt={`img of ${recipe.title}`} />
                </figure>
              </div>
              <div>
              <h4 style={{ color: "#4f6b57", fontSize: "1.3em", margin: 0, marginBottom: "10px" }}>by {recipe.created_by}</h4>{" "}
              {/* should be the creator username */}
              <p style={{ fontSize: "1em", color: "#4f6b57" }}>{recipe.description}</p>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
}
