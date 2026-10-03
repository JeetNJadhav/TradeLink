import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import {
  AccountConflictError,
  RefreshTokenReuseError,
} from "../../../modules/auth/auth.errors";
import type { AuthRepository } from "../../../modules/auth/auth.repository";
import type {
  NewAccount,
  RefreshSession,
  RefreshTokenRecord,
  UserRecord,
} from "../../../modules/auth/auth.types";

import { isUniqueViolation } from "../prisma.errors";

// A user has at most one profile; its name is the user's organization name.
const profileNames = {
  retailer: { select: { shopName: true } },
  distributor: { select: { businessName: true } },
} satisfies Prisma.UserInclude;

type UserWithProfileNames = Prisma.UserGetPayload<{
  include: typeof profileNames;
}>;

const toUserRecord = ({
  retailer,
  distributor,
  ...user
}: UserWithProfileNames): UserRecord => ({
  ...user,
  organizationName: retailer?.shopName ?? distributor?.businessName ?? null,
});

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: profileNames,
    });

    return user && toUserRecord(user);
  }

  async findUserById(userId: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: profileNames,
    });

    return user && toUserRecord(user);
  }

  async findUserByPhone(phone: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: profileNames,
    });

    return user && toUserRecord(user);
  }

  // A single nested create: the user, its profile and the location are stored
  // together or not at all.
  async createAccount(account: NewAccount): Promise<UserRecord> {
    const locations = { create: account.location };

    try {
      const user = await this.prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          phone: account.phone,
          password: account.passwordHash,
          role: account.role,
          ...(account.role === "RETAILER"
            ? {
                retailer: {
                  create: { shopName: account.organizationName, locations },
                },
              }
            : {
                distributor: {
                  create: {
                    businessName: account.organizationName,
                    contactInfo: account.contactInfo ?? null,
                    locations,
                  },
                },
              }),
        },
        include: profileNames,
      });

      return toUserRecord(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AccountConflictError();
      }

      throw error;
    }
  }

  async changePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  }

  async createRefreshSession(
    userId: string,
    token: RefreshTokenRecord,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    });
  }

  async findRefreshSessionByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async rotateRefreshSession(
    oldTokenId: string,
    userId: string,
    next: RefreshTokenRecord,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Atomically consume the old token. Only one concurrent refresh request can win.
      const consumed = await tx.refreshToken.updateMany({
        where: { id: oldTokenId, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (consumed.count !== 1) {
        throw new RefreshTokenReuseError();
      }

      const replacement = await tx.refreshToken.create({
        data: { userId, tokenHash: next.tokenHash, expiresAt: next.expiresAt },
      });

      await tx.refreshToken.update({
        where: { id: oldTokenId },
        data: { replacedByTokenId: replacement.id },
      });
    });
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id: tokenId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
