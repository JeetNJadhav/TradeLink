import { CHANGE_PASSWORD_API, PROFILE_API } from "../../../shared/api/api";
import apiClient from "../../../shared/api/apiClient";
import type { AccountDetails } from "../../../shared/types/account";
import type { Profile, ProfileResponse } from "../types/profile";

export const getProfile = async (signal?: AbortSignal): Promise<Profile> => {
  const response = await apiClient.get<ProfileResponse>(PROFILE_API, {
    signal,
  });
  return response.data.data.profile;
};

export const updateProfile = async (
  details: AccountDetails,
): Promise<Profile> => {
  const response = await apiClient.put<ProfileResponse>(PROFILE_API, details);
  return response.data.data.profile;
};

// The backend ends every other session and puts this one on new tokens; the
// new CSRF token in the response is picked up by apiClient.
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await apiClient.post(CHANGE_PASSWORD_API, { currentPassword, newPassword });
};
