import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toApiError } from "../../../shared/api/ApiError";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../roleRoutes";

const Login = () => {
  const { user, isLoading, login } = useAuth();

  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoading) return <p>Loading...</p>;

  // Covers both a fresh sign-in and opening /login while already signed in.
  // A page the role may not open is redirected again by ProtectedRoute.
  // `registered` is set by the registration page, `from` by ProtectedRoute.
  const state = location.state as {
    from?: string;
    registered?: boolean;
  } | null;

  if (user) {
    return <Navigate to={state?.from || ROLE_HOME[user.role]} replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Sign in</h1>
        {state?.registered && (
          <p className="auth-notice" role="status">
            Account created. Sign in to continue.
          </p>
        )}
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="auth-switch">
          New to TradeLink? <Link to="/register">Create an account</Link>
        </p>
        {/* Seed accounts are shown in development builds only. */}
        {import.meta.env.DEV && (
          <>
            <p className="auth-hint">
              Retailer: user1@seed.retaildist.local / SeedPassword123!
            </p>
            <p className="auth-hint">
              Distributor: user601@seed.retaildist.local / SeedPassword123!
            </p>
          </>
        )}
      </form>
    </main>
  );
};
export default Login;
