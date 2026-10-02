import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toApiError } from "../../../shared/api/ApiError";
import AccountDetailsFields from "../../../shared/components/AccountDetailsFields";
import {
  ACCOUNT_LIMITS,
  EMPTY_ACCOUNT_DETAILS,
  toAccountDetails,
} from "../../../shared/types/account";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../roleRoutes";
import { register } from "../services/authService";
import type { RegistrationRole } from "../types";

const ROLE_OPTIONS: { role: RegistrationRole; label: string }[] = [
  { role: "RETAILER", label: "Retailer — I buy stock for my shop" },
  { role: "DISTRIBUTOR", label: "Distributor — I supply retailers" },
];

const Register = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RegistrationRole>("RETAILER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [details, setDetails] = useState(EMPTY_ACCOUNT_DETAILS);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <p>Loading...</p>;

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({
        role,
        email: email.trim(),
        password,
        ...toAccountDetails(details, role === "DISTRIBUTOR"),
      });
      // Registration does not sign the user in.
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(toApiError(err).message);
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create an account</h1>

        <fieldset className="role-choice" disabled={submitting}>
          <legend>I am a</legend>
          {ROLE_OPTIONS.map((option) => (
            <label key={option.role}>
              <input
                type="radio"
                name="role"
                checked={role === option.role}
                onChange={() => setRole(option.role)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
            disabled={submitting}
            required
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={ACCOUNT_LIMITS.password.min}
            maxLength={ACCOUNT_LIMITS.password.max}
            disabled={submitting}
            required
          />
        </label>

        <AccountDetailsFields
          values={details}
          isDistributor={role === "DISTRIBUTOR"}
          disabled={submitting}
          onChange={setDetails}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
