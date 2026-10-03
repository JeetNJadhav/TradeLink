import { Link, NavLink } from "react-router-dom";
import TradeLinkLogo from "../../../shared/components/TradeLinkLogo";
import { env } from "../../../shared/config/env";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME, ROLE_NAV } from "../roleRoutes";

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
  const navItems = ROLE_NAV[user.role];

  return (
    <header className="auth-header">
      <Link
        className="auth-header-home"
        to={ROLE_HOME[user.role]}
        aria-label="TradeLink home"
      >
        <TradeLinkLogo />
      </Link>
      {navItems.length > 0 && (
        <nav className="auth-header-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
      {/* Admins have no profile to edit. */}
      {user.role === "ADMIN" ? (
        <span>{identity}</span>
      ) : (
        <Link className="auth-header-profile" to="/profile" title="Your profile">
          {identity}
        </Link>
      )}
      <button type="button" onClick={() => void logout()}>Logout</button>
    </header>
  );
};
