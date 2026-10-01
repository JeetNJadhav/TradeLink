import bcrypt from "bcrypt";

export interface PasswordHasher {
  hash(password: string): Promise<string>;

  verify(password: string, passwordHash: string): Promise<boolean>;
}

const BCRYPT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
