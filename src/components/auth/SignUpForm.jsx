import { useState } from "react";
import { useAuth } from "./AuthContext";
import "./auth.css";

export default function SignUpForm({ onBack, onSignUpSuccess }) {
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const first_name = formData.get("first_name");
    const last_name = formData.get("last_name");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await register({ first_name, last_name, username, email, password });
      setSuccess("Sign Up successful!");
      setError("");
      if (onSignUpSuccess) onSignUpSuccess();
    } catch (err) {
      setError(err.message || "Sign Up failed");
      setSuccess("");
    }
  };

  return (
    <div className="auth-overlay">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <input
          type="text"
          placeholder="First Name"
          name="first_name"
          required
        />
        <input type="text" placeholder="Last Name" name="last_name" required />
        <input type="text" placeholder="Username" name="username" required />
        <input type="email" placeholder="Email" name="email" required />
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <button type="submit">Sign Up</button>
        <p className="back-link" onClick={onBack}>
          Back
        </p>
      </form>
    </div>
  );
}
