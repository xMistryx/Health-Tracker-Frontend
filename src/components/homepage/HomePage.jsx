import React, { useState } from "react";
import "./home.css";
import drinkingWater from "../../assets/images/drinking-water3.jpg";
import exercise from "../../assets/images/exercise1.webp";
import running from "../../assets/images/running1.jpg";
import heartIcon from "../../assets/images/hearticon.png";

import SignInForm from "../auth/SignInForm";
import SignUpForm from "../auth/SignUpForm";
import Dashboard from "../dashboard/Dashboard"; // ✅ your dashboard page

export default function HomePage() {
  const desktopImages = [drinkingWater, exercise, running];
  const [activeForm, setActiveForm] = useState(null); // null / 'signin' / 'signup'
  const [user, setUser] = useState(null); // holds logged-in user info

  return (
    <div className="landing-container">
      {/* Header */}
      <div className="landing-header">
        <img src={heartIcon} alt="Heart" className="heart-icon" />
        <h2 className="health-title">Health Habit</h2>
      </div>

      {/* If user is logged in → show Dashboard */}
      {user ? (
        <Dashboard user={user} onSignOut={() => setUser(null)} />
      ) : (
        <>
          {/* Desktop Images */}
          <div className="desktop-images">
            {desktopImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Slide ${idx}`}
                className="landing-image"
              />
            ))}
          </div>

          {/* Mobile Image */}
          <div className="mobile-image">
            <img src={running} alt="Running" className="landing-image" />
          </div>

          {/* Overlay or Forms */}
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
                onSignIn={(loggedUser) => setUser(loggedUser)}
              />
            )}
            {activeForm === "signup" && (
              <SignUpForm
                onBack={() => setActiveForm(null)}
                onSignUpSuccess={() => setActiveForm("signin")} // ✅ switch to Sign In after successful sign-up
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
