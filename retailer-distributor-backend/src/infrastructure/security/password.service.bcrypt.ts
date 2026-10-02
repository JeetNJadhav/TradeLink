import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../modules/auth/password.service";

const BCRYPT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
