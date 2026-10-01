import { useAuth } from "../hooks/useAuth";

// Landing page for roles that do not have their own area yet.
const WorkspaceUnavailable = () => {
  const { user } = useAuth();

  return (
    <main className="workspace-unavailable">
      <h1>Nothing here yet</h1>
      <p>
        The {user?.role.toLowerCase()} workspace is not available yet. You can
        sign out and use a retailer account to browse and order products.
      </p>
    </main>
  );
};

export default WorkspaceUnavailable;
