import type { ReactNode } from "react";
import BackButton from "../../../shared/components/BackButton";
import { useAuth } from "../../auth/hooks/useAuth";
import { ROLE_HOME } from "../../auth/roleRoutes";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ProfileForm from "../components/ProfileForm";
import useProfile from "../hooks/useProfile";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { profile, loading, error, reload } = useProfile();

  // The header shows the user's name, so it is re-read along with the profile.
  const handleSaved = () => {
    reload();
    void refreshUser();
  };

  let content: ReactNode;

  if (loading) {
    content = <p>Loading profile...</p>;
  } else if (error) {
    content = (
      <p className="auth-error" role="alert">
        {error.message}
      </p>
    );
  } else if (!profile) {
    content = <p>Profile not found.</p>;
  } else {
    content = (
      <>
        <ProfileForm profile={profile} onSaved={handleSaved} />
        <ChangePasswordForm />
      </>
    );
  }

  return (
    <div className="profile-page">
      <BackButton fallback={user ? ROLE_HOME[user.role] : "/"} />

      <h1>Profile</h1>

      {content}
    </div>
  );
};

export default Profile;
