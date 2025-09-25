import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import HomePage from "./components/homepage/HomePage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ProfilePage from "./components/profilepage/ProfilePage.jsx";
import CommitmentPage from "./components/commitments/CommitmentPage.jsx";
import WaterLogs from "./components/dashboard/WaterDash.jsx";
import SleepLogs from "./components/dashboard/SleepDash.jsx";
import ExerciseLogs from "./components/dashboard/ExerciseDash.jsx";

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
        </Route>
      </Routes>
    </>
  );
}
