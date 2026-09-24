import { useAuth } from "../context/AuthContext";

export const AuthHeader = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <header className="auth-header">
      <span>{user.name} · {user.role}</span>
      <button type="button" onClick={() => void logout()}>Logout</button>
    </header>
  );
};
