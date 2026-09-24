import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);
