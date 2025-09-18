import React, { useState } from "react";
import "./auth.css";
import * as jwtDecode from "jwt-decode";

export default function SignInForm({ onBack, onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setSuccess("");
      } else {
        setSuccess("Login successful!");
        setError("");

        let user = null;

        // CASE 1: backend returns user + token
        if (data.user) {
          user = data.user;
        }
        // CASE 2: backend returns only token
        else if (data.token) {
          const decoded = jwtDecode(data.token);
          user = decoded; // decoded info from JWT
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          if (data.token) localStorage.setItem("token", data.token);

          // callback to HomePage to update dashboard
          onSignIn(user);
        }
      }
    } catch (err) {
      setError("Server error: " + err.message);
      setSuccess("");
    }
  };

  return (
    <div className="auth-overlay">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
        <p className="back-link" onClick={onBack}>
          Back
        </p>
      </form>
    </div>
  );
}
