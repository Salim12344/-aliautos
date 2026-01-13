import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Auth.css";
import { auth } from "./storage";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = auth.register(email, password, '');
      } else {
        result = auth.login(email, password);
      }

      // Notify other parts of the app
      window.dispatchEvent(new Event('auth_token_changed'));

      // Redirect to original destination or based on role
      if (redirect) {
        navigate(redirect);
      } else {
        const userRole = result.user.role || 'user';
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'front_desk') navigate('/front-desk');
        else navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err && err.message ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>

        <form onSubmit={handleAuth}>
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
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
