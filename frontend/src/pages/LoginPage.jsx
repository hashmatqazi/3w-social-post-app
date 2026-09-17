import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiSignup } from "../utils/api";

// Combined Login / Signup page with tab switching
export default function LoginPage({ onToast }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { ok, data } = await apiLogin(loginEmail, loginPassword);
    setLoading(false);

    if (!ok) {
      onToast(data.message || "Login failed", "error");
      return;
    }

    login(data.token, data.user);
    onToast(`Welcome back, ${data.user.username}!`, "success");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { ok, data } = await apiSignup(signupUsername, signupEmail, signupPassword);
    setLoading(false);

    if (!ok) {
      onToast(data.message || "Signup failed", "error");
      return;
    }

    onToast("Account created! Please log in.", "success");
    setIsLogin(true);
    setSignupUsername("");
    setSignupEmail("");
    setSignupPassword("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌐</div>
        <h1 className="auth-title">3W Social</h1>
        <p className="auth-subtitle">Connect, share and interact.</p>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
            <p className="auth-switch">
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Sign up</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="yourname"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </button>
            <p className="auth-switch">
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
