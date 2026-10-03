import { AuthError } from "./auth.errors";
import type { UserAccountRepository } from "./auth.repository";
import type { AuthenticatedUser } from "./auth.types";
import { normalizeEmail, toPublicUser } from "./auth.user";
import type { PasswordHasher } from "./password.service";
import type { SessionService } from "./session.service";

// Checks credentials and is the one entry point the auth routes use for
// signed-in users; the sessions themselves are SessionService's job.
export class AuthService {
  constructor(
    private readonly accounts: Pick<
      UserAccountRepository,
      "findUserByEmail" | "findUserById" | "changePassword"
    >,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.accounts.findUserByEmail(normalizeEmail(email));

    if (
      !user ||
      !(await this.passwordHasher.verify(password, user.password))
    )
      throw new AuthError("Invalid email or password");

    return this.sessions.start(user);
  }

  // Ends every session of the user and starts a new one for the caller, so a
  // changed password signs out all other devices.
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.accounts.findUserById(userId);
    if (!user) throw new AuthError("User no longer exists");

    if (!(await this.passwordHasher.verify(currentPassword, user.password)))
      throw new AuthError("Current password is incorrect", 400);

    await this.accounts.changePassword(
      user.id,
      await this.passwordHasher.hash(newPassword),
    );

    return this.sessions.start(user);
  }

  refresh(rawRefreshToken: string) {
    return this.sessions.refresh(rawRefreshToken);
  }

  logout(rawRefreshToken?: string) {
    return this.sessions.end(rawRefreshToken);
  }

  async getCurrentUser(authenticatedUser: AuthenticatedUser) {
    const user = await this.accounts.findUserById(authenticatedUser.userId);
    if (!user) throw new AuthError("User no longer exists");
    return toPublicUser(user);
  }
}
