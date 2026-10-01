import { AppError } from "../../utils/errors";

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
  }
}

// Thrown by the repository when a refresh token was already consumed by another request.
export class RefreshTokenReuseError extends Error {
  constructor() {
    super("Refresh token was already used");
    this.name = "RefreshTokenReuseError";
  }
}
