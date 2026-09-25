import { AuthenticatedUser, Role } from "./auth.types";
import {
  createRefreshSession,
  findRefreshSession,
  findUserByEmail,
  findUserById,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  rotateRefreshSession,
} from "./auth.repository";
import { verifyPassword } from "./password.service";
import { createAccessToken } from "./token.service";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const toAuthenticatedUser = (user: {
  id: string;
  role: Role;
}): AuthenticatedUser => ({
  userId: user.id,
  role: user.role,
});

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.password)))
    throw new AuthError("Invalid email or password");

  const authenticatedUser = toAuthenticatedUser({
    id: user.id,
    role: user.role,
  });

  const accessToken = createAccessToken(
    authenticatedUser.userId,
    authenticatedUser.role,
  );

  const refresh = await createRefreshSession(authenticatedUser.userId);

  return { accessToken, refreshToken: refresh.token, authenticatedUser };
};

export const refresh = async (rawRefreshToken: string) => {
  const session = await findRefreshSession(rawRefreshToken);
  if (!session) throw new AuthError("Invalid refresh token");
  if (session.revokedAt) {
    if (session.replacedByTokenId)
      await revokeAllRefreshTokensForUser(session.userId);
    throw new AuthError("Refresh token is no longer valid");
  }
  if (session.expiresAt <= new Date()) {
    await revokeRefreshToken(session.id);
    throw new AuthError("Refresh token has expired");
  }
  const user = await findUserById(session.userId);
  if (!user) throw new AuthError("User no longer exists");
  const authenticatedUser = toAuthenticatedUser({
    id: user.id,
    role: user.role,
  });
  try {
    const rotated = await rotateRefreshSession(session.id, session.userId);
    return {
      accessToken: createAccessToken(
        authenticatedUser.userId,
        authenticatedUser.role,
      ),
      refreshToken: rotated.token,
      authenticatedUser,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "REFRESH_TOKEN_REUSE") {
      await revokeAllRefreshTokensForUser(session.userId);
      throw new AuthError("Refresh token reuse detected");
    }
    throw error;
  }
};

export const logout = async (rawRefreshToken?: string) => {
  if (!rawRefreshToken) return;
  const session = await findRefreshSession(rawRefreshToken);
  if (session) await revokeRefreshToken(session.id);
};

export const getCurrentUser = async (authenticatedUser: AuthenticatedUser) => {
  const user = await findUserById(authenticatedUser.userId);
  if (!user) throw new AuthError("User no longer exists");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};
