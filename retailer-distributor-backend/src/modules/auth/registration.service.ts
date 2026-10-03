import { AccountConflictError, AuthError } from "./auth.errors";
import type { UserAccountRepository } from "./auth.repository";
import type { RegisterInput } from "./auth.types";
import { normalizeEmail, toPublicUser } from "./auth.user";
import type { PasswordHasher } from "./password.service";

export class RegistrationService {
  constructor(
    private readonly accounts: Pick<
      UserAccountRepository,
      "findUserByEmail" | "findUserByPhone" | "createAccount"
    >,
    private readonly passwordHasher: Pick<PasswordHasher, "hash">,
  ) {}

  // Creates the account only; the new user signs in afterwards.
  async register(input: RegisterInput) {
    const { password, ...details } = input;
    const email = normalizeEmail(input.email);

    if (await this.accounts.findUserByEmail(email))
      throw new AuthError("Email is already registered", 409);
    if (await this.accounts.findUserByPhone(input.phone))
      throw new AuthError("Phone number is already registered", 409);

    try {
      const user = await this.accounts.createAccount({
        ...details,
        email,
        // Retailers have no contact info.
        contactInfo:
          input.role === "DISTRIBUTOR" ? input.contactInfo : undefined,
        passwordHash: await this.passwordHasher.hash(password),
      });

      return toPublicUser(user);
    } catch (error) {
      // Another sign-up took the email or phone after the checks above.
      if (error instanceof AccountConflictError)
        throw new AuthError(error.message, 409);
      throw error;
    }
  }
}
