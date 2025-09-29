import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import sprouticon from "../../assets/images/sprout-icon.jpeg";
import sprout from "../../assets/images/sprout.png";

import SignInForm from "../auth/SignInForm";
import SignUpForm from "../auth/SignUpForm";
import Dashboard from "../dashboard/Dashboard"; // ✅ your dashboard page

export default function HomePage() {
  const [activeForm, setActiveForm] = useState(null);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="landing-header">
        <img src={sprouticon} alt="sprout" className="sprout-icon" />
        <h2 className="health-title">Tend</h2>
      </div>

      {user ? (
        <Dashboard user={user} onSignOut={() => setUser(null)} />
      ) : (
        <>
          <div className="desktop-images">
            <img src={sprout} alt="sprout" className="landing-image" />
          </div>

          <div className="overlay">
            {!activeForm && (
              <>
                <button
                  className="landing-button"
                  onClick={() => setActiveForm("signin")}
                >
                  Sign In
                </button>
                <p className="landing-links">
                  Don’t have an account?{" "}
                  <span
                    className="signup-link"
                    onClick={() => setActiveForm("signup")}
                  >
                    Sign Up
                  </span>
                </p>
              </>
            )}

            {activeForm === "signin" && (
              <SignInForm
                onBack={() => setActiveForm(null)}
                onSignIn={(loggedUser) => {
                  setUser(loggedUser);
                  navigate("/dashboard");
                }}
              />
            )}
            {activeForm === "signup" && (
              <SignUpForm
                onBack={() => setActiveForm(null)}
                onSignUpSuccess={() => {
                  setActiveForm(null);
                  navigate("/dashboard");
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
