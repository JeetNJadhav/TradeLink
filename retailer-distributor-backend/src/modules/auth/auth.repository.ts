import { prisma } from "../../config/prisma";
import { createRefreshToken, hashRefreshToken } from "./token.service";

export const findUserByEmail = async (email: string) =>
  prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

export const findUserById = async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
  });

export const createRefreshSession = async (userId: string) => {
  const tokenData = createRefreshToken();
  const session = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: tokenData.tokenHash,
      expiresAt: tokenData.expiresAt,
    },
  });
  return { session, ...tokenData };
};

export const findRefreshSession = async (rawToken: string) =>
  prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(rawToken) },
  });

export const rotateRefreshSession = async (
  oldTokenId: string,
  userId: string,
) => {
  const next = createRefreshToken();
  return prisma.$transaction(async (tx) => {
    // Atomically consume the old token. Only one concurrent refresh request can win.
    const consumed = await tx.refreshToken.updateMany({
      where: { id: oldTokenId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (consumed.count !== 1) {
      throw new Error("REFRESH_TOKEN_REUSE");
    }

    const replacement = await tx.refreshToken.create({
      data: { userId, tokenHash: next.tokenHash, expiresAt: next.expiresAt },
    });

    await tx.refreshToken.update({
      where: { id: oldTokenId },
      data: { replacedByTokenId: replacement.id },
    });

    return { replacement, ...next };
  });
};

export const revokeRefreshToken = async (tokenId: string) => {
  await prisma.refreshToken.updateMany({
    where: { id: tokenId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllRefreshTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
