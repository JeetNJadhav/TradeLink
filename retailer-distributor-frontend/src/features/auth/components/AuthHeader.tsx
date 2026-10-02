import { Link } from "react-router-dom";
import TradeLinkLogo from "../../../shared/components/TradeLinkLogo";
import { env } from "../../../shared/config/env";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../roleRoutes";

export const AuthHeader = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  // The organization name is a development aid for telling test accounts apart.
  const identity = [
    user.name,
    env.isDev ? user.organizationName : null,
    user.role,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="auth-header">
      <Link
        className="auth-header-home"
        to={ROLE_HOME[user.role]}
        aria-label="TradeLink home"
      >
        <TradeLinkLogo />
      </Link>
      <span>{identity}</span>
      <button type="button" onClick={() => void logout()}>Logout</button>
    </header>
  );
};
