import { type FormEvent, useState } from "react";
import { ACCOUNT_LIMITS } from "../../../shared/types/account";
import useProfileAction from "../hooks/useProfileAction";
import { changePassword } from "../services/profileService";

const MISMATCH_MESSAGE = "The new passwords do not match.";

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [changed, setChanged] = useState(false);
  const change = useProfileAction();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setChanged(false);

    if (newPassword !== confirmation) {
      setMismatch(true);
      return;
    }

    setMismatch(false);

    const succeeded = await change.run(() =>
      changePassword(currentPassword, newPassword),
    );

    if (succeeded) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setChanged(true);
    }
  };

  const error = mismatch ? MISMATCH_MESSAGE : change.error;

  return (
    <form className="auth-card profile-card" onSubmit={handleSubmit}>
      <h2>Change password</h2>

      <label>
        Current password
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          disabled={change.submitting}
          required
        />
      </label>

      <label>
        New password
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={ACCOUNT_LIMITS.password.min}
          maxLength={ACCOUNT_LIMITS.password.max}
          disabled={change.submitting}
          required
        />
      </label>

      <label>
        Repeat new password
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          type="password"
          autoComplete="new-password"
          disabled={change.submitting}
          required
        />
      </label>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {changed && (
        <p className="auth-notice" role="status">
          Password changed. Your other devices were signed out.
        </p>
      )}

      <button type="submit" disabled={change.submitting}>
        {change.submitting ? "Changing..." : "Change password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
