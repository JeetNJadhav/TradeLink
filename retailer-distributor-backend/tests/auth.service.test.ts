import { beforeEach, describe, expect, it } from "vitest";
import {
  AccountConflictError,
  RefreshTokenReuseError,
} from "../src/modules/auth/auth.errors";
import type { AuthRepository } from "../src/modules/auth/auth.repository";
import { AuthService } from "../src/modules/auth/auth.service";
import type {
  NewAccount,
  RefreshSession,
  RegisterInput,
  RefreshTokenRecord,
  UserRecord,
} from "../src/modules/auth/auth.types";
import type { PasswordHasher } from "../src/modules/auth/password.service";
import { RegistrationService } from "../src/modules/auth/registration.service";
import { SessionService } from "../src/modules/auth/session.service";
import type { TokenService } from "../src/modules/auth/token.service";

interface StoredSession extends RefreshSession {
  tokenHash: string;
}

const user: UserRecord = {
  id: "user-1",
  name: "Asha Retailer",
  email: "asha@example.com",
  phone: "9000000001",
  password: "hashed:secret-password",
  role: "RETAILER",
  organizationName: "Corner Shop",
};

class InMemoryAuthRepository implements AuthRepository {
  users: UserRecord[] = [{ ...user }];
  accounts: NewAccount[] = [];
  sessions: StoredSession[] = [];

  async findUserByEmail(email: string) {
    return this.users.find((candidate) => candidate.email === email) ?? null;
  }

  async findUserById(userId: string) {
    return this.users.find((candidate) => candidate.id === userId) ?? null;
  }

  async findUserByPhone(phone: string) {
    return this.users.find((candidate) => candidate.phone === phone) ?? null;
  }

  async createAccount(account: NewAccount) {
    const taken = this.users.some(
      (candidate) =>
        candidate.email === account.email || candidate.phone === account.phone,
    );

    if (taken) {
      throw new AccountConflictError();
    }

    const created: UserRecord = {
      id: `user-${this.users.length + 1}`,
      name: account.name,
      email: account.email,
      phone: account.phone,
      password: account.passwordHash,
      role: account.role,
      organizationName: account.organizationName,
    };

    this.users.push(created);
    this.accounts.push(account);

    return created;
  }

  async changePassword(userId: string, passwordHash: string) {
    const found = this.users.find((candidate) => candidate.id === userId);

    if (found) {
      found.password = passwordHash;
    }

    await this.revokeAllRefreshTokensForUser(userId);
  }

  async createRefreshSession(userId: string, token: RefreshTokenRecord) {
    this.sessions.push({
      id: `session-${this.sessions.length + 1}`,
      userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revokedAt: null,
      replacedByTokenId: null,
    });
  }

  async findRefreshSessionByTokenHash(tokenHash: string) {
    const session = this.sessions.find(
      (candidate) => candidate.tokenHash === tokenHash,
    );

    return session ? { ...session } : null;
  }

  async rotateRefreshSession(
    oldTokenId: string,
    userId: string,
    next: RefreshTokenRecord,
  ) {
    const old = this.sessions.find((session) => session.id === oldTokenId);

    if (!old || old.revokedAt) {
      throw new RefreshTokenReuseError();
    }

    await this.createRefreshSession(userId, next);
    old.revokedAt = new Date();
    old.replacedByTokenId = this.sessions[this.sessions.length - 1].id;
  }

  async revokeRefreshToken(tokenId: string) {
    const session = this.sessions.find((candidate) => candidate.id === tokenId);

    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
    }
  }

  async revokeAllRefreshTokensForUser(userId: string) {
    for (const session of this.sessions) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = new Date();
      }
    }
  }

  active() {
    return this.sessions.filter((session) => !session.revokedAt);
  }
}

const passwordHasher: PasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  verify: async (password, hash) => hash === `hashed:${password}`,
};

const createTokenService = (): TokenService => {
  let issued = 0;

  return {
    createAccessToken: (userId, role) => `access:${userId}:${role}`,
    verifyAccessToken: () => {
      throw new Error("not used");
    },
    createRefreshToken: () => {
      const token = `refresh-${++issued}`;

      return {
        token,
        tokenHash: `hash:${token}`,
        expiresAt: new Date(Date.now() + 60_000),
      };
    },
    hashRefreshToken: (token) => `hash:${token}`,
  };
};

describe("AuthService", () => {
  let repository: InMemoryAuthRepository;
  let service: AuthService;
  let registration: RegistrationService;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    service = new AuthService(
      repository,
      passwordHasher,
      new SessionService(repository, repository, createTokenService()),
    );
    registration = new RegistrationService(repository, passwordHasher);
  });

  const login = () => service.login(user.email, "secret-password");

  describe("login", () => {
    it("starts a session and returns only public user fields", async () => {
      const result = await login();

      expect(result.accessToken).toBe("access:user-1:RETAILER");
      expect(result.user).toEqual({
        id: "user-1",
        name: "Asha Retailer",
        email: "asha@example.com",
        phone: "9000000001",
        role: "RETAILER",
        organizationName: "Corner Shop",
      });
      expect(repository.active()).toHaveLength(1);
    });

    it("matches the email whatever its case", async () => {
      const result = await service.login(
        " Asha@Example.COM ",
        "secret-password",
      );

      expect(result.user.id).toBe("user-1");
    });

    it("rejects a wrong password and an unknown email the same way", async () => {
      await expect(
        service.login(user.email, "wrong-password"),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
      await expect(
        service.login("nobody@example.com", "secret-password"),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
    });
  });

  describe("register", () => {
    const input: RegisterInput = {
      role: "DISTRIBUTOR",
      name: "Ravi Distributor",
      email: "Ravi@Example.com",
      phone: "9000000002",
      password: "new-password",
      organizationName: "Wholesale One",
      contactInfo: "+91-9000000002",
      location: {
        address: "Baner Road, Shop 4",
        city: "Pune",
        latitude: 18.559,
        longitude: 73.7868,
      },
    };

    it("creates a distributor account and starts no session", async () => {
      const created = await registration.register(input);

      expect(created).toEqual({
        id: "user-2",
        name: "Ravi Distributor",
        email: "ravi@example.com",
        phone: "9000000002",
        role: "DISTRIBUTOR",
        organizationName: "Wholesale One",
      });
      expect(repository.accounts[0]).toMatchObject({
        passwordHash: "hashed:new-password",
        contactInfo: "+91-9000000002",
        location: input.location,
      });
      expect(repository.accounts[0]).not.toHaveProperty("password");
      expect(repository.sessions).toHaveLength(0);
    });

    it("lets the new user sign in with the chosen password", async () => {
      await registration.register(input);

      const result = await service.login("ravi@example.com", "new-password");

      expect(result.user.role).toBe("DISTRIBUTOR");
    });

    it("creates a retailer account without contact info", async () => {
      await registration.register({ ...input, role: "RETAILER" });

      expect(repository.accounts[0].role).toBe("RETAILER");
      expect(repository.accounts[0].contactInfo).toBeUndefined();
    });

    it("rejects an email that is already registered, whatever its case", async () => {
      await expect(
        registration.register({ ...input, email: "ASHA@example.com" }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Email is already registered",
      });
      expect(repository.users).toHaveLength(1);
    });

    it("rejects a phone number that is already registered", async () => {
      await expect(
        registration.register({ ...input, phone: user.phone }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Phone number is already registered",
      });
      expect(repository.users).toHaveLength(1);
    });

    it("reports a sign-up that lost the race for the email as a conflict", async () => {
      // The checks pass, then another sign-up stores the same email first.
      repository.findUserByEmail = async () => null;

      await expect(
        registration.register({ ...input, email: user.email }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("changePassword", () => {
    it("stores the new password and keeps only a new session", async () => {
      await login();
      await login();

      const result = await service.changePassword(
        user.id,
        "secret-password",
        "better-password",
      );

      expect(repository.users[0].password).toBe("hashed:better-password");
      expect(repository.active()).toHaveLength(1);
      await expect(service.refresh(result.refreshToken)).resolves.toBeDefined();
      await expect(login()).rejects.toMatchObject({ statusCode: 401 });
      await expect(
        service.login(user.email, "better-password"),
      ).resolves.toBeDefined();
    });

    it("rejects a wrong current password and changes nothing", async () => {
      await login();

      await expect(
        service.changePassword(user.id, "wrong-password", "better-password"),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Current password is incorrect",
      });
      expect(repository.users[0].password).toBe("hashed:secret-password");
      expect(repository.active()).toHaveLength(1);
    });
  });

  describe("refresh", () => {
    it("rotates the token: the old one is replaced by a new one", async () => {
      const { refreshToken } = await login();

      const refreshed = await service.refresh(refreshToken);

      expect(refreshed.refreshToken).not.toBe(refreshToken);
      expect(repository.sessions[0].revokedAt).not.toBeNull();
      expect(repository.sessions[0].replacedByTokenId).toBe("session-2");
      expect(repository.active()).toHaveLength(1);
    });

    it("lets a second request use the same token right after a rotation", async () => {
      const { refreshToken } = await login();
      const first = await service.refresh(refreshToken);

      const second = await service.refresh(refreshToken);

      expect(second.refreshToken).not.toBe(first.refreshToken);
      // Both requests hold a working session; nothing was revoked.
      expect(repository.active()).toHaveLength(2);
      await expect(service.refresh(first.refreshToken)).resolves.toBeDefined();
    });

    it("keeps the session when the rotation itself loses the race", async () => {
      const { refreshToken } = await login();
      const rotate = repository.rotateRefreshSession.bind(repository);

      // Another request rotates the token after this one has read it.
      repository.rotateRefreshSession = async (...args) => {
        repository.rotateRefreshSession = rotate;
        await rotate(args[0], args[1], {
          tokenHash: "hash:other-request",
          expiresAt: new Date(Date.now() + 60_000),
        });

        return rotate(...args);
      };

      await expect(service.refresh(refreshToken)).resolves.toBeDefined();
      expect(repository.active()).toHaveLength(2);
    });

    it("treats a rotated token presented after the leeway as stolen", async () => {
      const { refreshToken } = await login();
      await service.refresh(refreshToken);
      repository.sessions[0].revokedAt = new Date(Date.now() - 60_000);

      await expect(service.refresh(refreshToken)).rejects.toMatchObject({
        statusCode: 401,
        message: "Refresh token reuse detected",
      });
      expect(repository.active()).toHaveLength(0);
    });

    it("rejects a token after logout without revoking other sessions", async () => {
      const { refreshToken } = await login();
      await login();
      await service.logout(refreshToken);

      await expect(service.refresh(refreshToken)).rejects.toMatchObject({
        statusCode: 401,
        message: "Refresh token is no longer valid",
      });
      expect(repository.active()).toHaveLength(1);
    });

    it("rejects and revokes an expired token", async () => {
      const { refreshToken } = await login();
      repository.sessions[0].expiresAt = new Date(Date.now() - 1);

      await expect(service.refresh(refreshToken)).rejects.toMatchObject({
        statusCode: 401,
        message: "Refresh token has expired",
      });
      expect(repository.active()).toHaveLength(0);
    });

    it("rejects an unknown token", async () => {
      await expect(service.refresh("never-issued")).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid refresh token",
      });
    });
  });
});
