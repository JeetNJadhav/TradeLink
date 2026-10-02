import { AppError } from "../../utils/errors";

export class ProfileError extends AppError {}

// Thrown by the repository when the new phone number belongs to another user.
export class ProfileConflictError extends Error {
  constructor() {
    super("Phone number is already registered");
    this.name = "ProfileConflictError";
  }
}
