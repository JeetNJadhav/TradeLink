import { type FormEvent, useState } from "react";
import AccountDetailsFields from "../../../shared/components/AccountDetailsFields";
import {
  type AccountDetailsValues,
  toAccountDetails,
} from "../../../shared/types/account";
import useProfileAction from "../hooks/useProfileAction";
import { updateProfile } from "../services/profileService";
import type { Profile } from "../types/profile";

interface ProfileFormProps {
  profile: Profile;
  onSaved: () => void;
}

const toFormValues = (profile: Profile): AccountDetailsValues => ({
  name: profile.name,
  phone: profile.phone,
  organizationName: profile.organizationName,
  contactInfo: profile.contactInfo ?? "",
  address: profile.location?.address ?? "",
  city: profile.location?.city ?? "",
  latitude: profile.location ? String(profile.location.latitude) : "",
  longitude: profile.location ? String(profile.location.longitude) : "",
});

const ProfileForm = ({ profile, onSaved }: ProfileFormProps) => {
  const [values, setValues] = useState(() => toFormValues(profile));
  const [saved, setSaved] = useState(false);
  const save = useProfileAction();

  const isDistributor = profile.role === "DISTRIBUTOR";

  const handleChange = (next: AccountDetailsValues) => {
    setSaved(false);
    setValues(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);

    const succeeded = await save.run(() =>
      updateProfile(toAccountDetails(values, isDistributor)),
    );

    if (succeeded) {
      setSaved(true);
      onSaved();
    }
  };

  return (
    <form className="auth-card profile-card" onSubmit={handleSubmit}>
      <h2>Your details</h2>

      <label>
        Email
        <input value={profile.email} type="email" readOnly disabled />
      </label>

      <AccountDetailsFields
        values={values}
        isDistributor={isDistributor}
        disabled={save.submitting}
        onChange={handleChange}
      />

      {save.error && (
        <p className="auth-error" role="alert">
          {save.error}
        </p>
      )}

      {saved && (
        <p className="auth-notice" role="status">
          Profile saved.
        </p>
      )}

      <button type="submit" disabled={save.submitting}>
        {save.submitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
};

export default ProfileForm;
