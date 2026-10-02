import type { Profile, UpdateProfileInput } from "./profile.types";

export interface ProfileRepository {
  // Null when the user has no retailer or distributor profile.
  findByUserId(userId: string): Promise<Profile | null>;

  // Applies all changes or none. Null when the user has no profile.
  // Throws ProfileConflictError if the phone belongs to another user.
  update(userId: string, changes: UpdateProfileInput): Promise<Profile | null>;
}
