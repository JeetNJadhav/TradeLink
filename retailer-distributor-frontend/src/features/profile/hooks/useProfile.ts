import { useAsync } from "../../../shared/hooks/useAsync";
import { getProfile } from "../services/profileService";

// The signed-in user's profile. `reload` refreshes it after a save.
// getProfile is a module-level function, so its identity is already stable.
const useProfile = () => {
  const { data, loading, error, reload } = useAsync(getProfile);

  return { profile: data, loading, error, reload };
};

export default useProfile;
