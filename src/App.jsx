import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import HomePage from "./components/homepage/HomePage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ProfilePage from "./components/profilepage/ProfilePage.jsx";
import CommitmentPage from "./components/commitments/CommitmentPage.jsx";
import WaterLogs from "./components/logs/water/WaterLogs.jsx";
import SleepLogs from "./components/logs/sleep/SleepLogs.jsx";
import ExerciseLogs from "./components/logs/exercise/ExerciseLogs.jsx";
import FoodLogs from "./components/logs/food/FoodLogs.jsx";
import RecipesCatalog from "./components/recipes/RecipesCatalog.jsx";
import RecipeForm from "./components/recipes/RecipeForm.jsx";
import RecipeDetails from "./components/recipes/RecipeDetails.jsx";
import Error404 from "./components/recipes/Error404.jsx";
export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/commitment" element={<CommitmentPage />} />
          <Route path="/water" element={<WaterLogs />} />
          <Route path="/sleep" element={<SleepLogs />} />
          <Route path="/exercise" element={<ExerciseLogs />} />
          <Route path="/food" element={<FoodLogs />} />
          <Route path="/recipes" element={<RecipesCatalog />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/*" element={<Error404 />} />
        </Route>
      </Routes>
    </>
  );
}
