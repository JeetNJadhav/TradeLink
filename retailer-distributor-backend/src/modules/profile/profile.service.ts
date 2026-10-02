import { ProfileConflictError, ProfileError } from "./profile.errors";
import type { ProfileRepository } from "./profile.repository";
import type { Profile, UpdateProfileInput } from "./profile.types";

// The signed-in retailer's or distributor's own details.
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new ProfileError("Profile not found", 404);
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<Profile> {
    try {
      const profile = await this.profileRepository.update(userId, input);

      if (!profile) {
        throw new ProfileError("Profile not found", 404);
      }

      return profile;
    } catch (error) {
      if (error instanceof ProfileConflictError) {
        throw new ProfileError(error.message, 409);
      }

      throw error;
    }
  }
}
