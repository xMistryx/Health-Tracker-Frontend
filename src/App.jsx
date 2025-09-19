import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/HomePage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ProfilePage from "./components/profilepage/ProfilePage.jsx";
import Progress from "./components/progress/Progress.jsx";
import WaterProgress from "./components/progress/WaterProgress.jsx";
import SleepLog from "./components/progress/SleepLog.jsx";
import ExerciseLog from "./components/progress/ExerciseLog.jsx";

import SignIn from "./components/auth/SignInForm.jsx";
import SignUp from "./components/auth/SignUpForm.jsx";

import "./App.css";

function App() {
  const user = { id: 4, first_name: "shiva" }; // later: get from auth context

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        {/* Progress Routes */}
        <Route path="/progress/water" element={<WaterProgress />} />
        <Route path="/progress/sleep" element={<SleepLog />} />
        <Route path="/progress/exercise" element={<ExerciseLog />} />
      </Routes>
    </Router>
  );
}

export default App;
