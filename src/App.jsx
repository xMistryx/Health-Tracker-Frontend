import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/HomePage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ProfilePage from "./components/profilepage/ProfilePage.jsx";
import Progress from "./components/progress/Progress.jsx";
import WaterProgress from "./components/progress/WaterProgress.jsx";
import SleepProgress from "./components/progress/SleepProgress.jsx";
import ExerciseProgress from "./components/progress/ExerciseProgress.jsx";
import FoodProgress from "./components/progress/FoodProgress.jsx";

import SignIn from "./components/auth/SignInForm.jsx";
import SignUp from "./components/auth/SignUpForm.jsx";
import { WaterProvider } from "./context/WaterContext.jsx";
import { SleepProvider } from "./context/SleepContext.jsx";
import { ExerciseProvider } from "./context/ExerciseContext.jsx";

import "./App.css";

function App() {
  const user = { id: 4, first_name: "shiva" }; // later: get from auth context

  return (
    <WaterProvider>
      <SleepProvider>
        <ExerciseProvider>
          {" "}
          {/* ✅ wrap your app with WaterProvider */}
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
              <Route path="/progress/sleep" element={<SleepProgress />} />
              <Route path="/progress/exercise" element={<ExerciseProgress />} />
              <Route path="/progress/food" element={<FoodProgress />} />
            </Routes>
          </Router>
        </ExerciseProvider>
      </SleepProvider>
    </WaterProvider>
  );
}

export default App;
