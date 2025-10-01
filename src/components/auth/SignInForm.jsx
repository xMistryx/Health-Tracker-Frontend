
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignInForm({ onBack, onSignIn }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");
        try {
            await login({ email, password });
            setSuccess("Login successful!");
            setError("");
            if (onSignIn) onSignIn();
            // If onSignIn does not handle navigation, fallback:
            // navigate("/dashboard");
        } catch (error) {
            setError("Login failed. Please check your credentials.");
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
                    name="email"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
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
