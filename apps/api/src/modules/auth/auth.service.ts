import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { LoginInput } from './auth.dto';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const BCRYPT_COST = 12;

/**
 * Generates a signed JWT access token for a user.
 */
function generateAccessToken(payload: object): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generates a signed JWT refresh token for a user.
 */
function generateRefreshToken(payload: object): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/** Auth service handling login, refresh, and logout operations */
export const authService = {
  /**
   * Authenticates a user with email and password.
   * Returns access and refresh tokens on success.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role, officeId: user.officeId };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in Redis with 7d TTL
    await redis.setex(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  },

  /**
   * Refreshes an expired access token using a valid refresh token.
   */
  async refresh(refreshToken: string) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');

    let payload: { id: string; email: string; role: string; officeId: string };
    try {
      payload = jwt.verify(refreshToken, secret) as typeof payload;
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401, code: 'TOKEN_INVALID' });
    }

    const stored = await redis.get(`refresh:${payload.id}`);
    if (stored !== refreshToken) {
      throw Object.assign(new Error('Refresh token revoked'), { statusCode: 401, code: 'TOKEN_REVOKED' });
    }

    const accessToken = generateAccessToken({ id: payload.id, email: payload.email, role: payload.role, officeId: payload.officeId });
    return { accessToken };
  },

  /**
   * Logs out a user by revoking their refresh token from Redis.
   */
  async logout(userId: string) {
    await redis.del(`refresh:${userId}`);
  },

  /**
   * Hash a plain-text password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
  },
};
