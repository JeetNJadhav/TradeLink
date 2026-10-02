import { AppError } from "../../utils/errors";

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
  }
}

// Thrown by the repository when the email or phone of a new account is already
// taken, e.g. by a sign-up that finished a moment earlier.
export class AccountConflictError extends Error {
  constructor() {
    super("Email or phone is already registered");
    this.name = "AccountConflictError";
  }
}

// Thrown by the repository when a refresh token was already consumed by another request.
export class RefreshTokenReuseError extends Error {
  constructor() {
    super("Refresh token was already used");
    this.name = "RefreshTokenReuseError";
  }
}
