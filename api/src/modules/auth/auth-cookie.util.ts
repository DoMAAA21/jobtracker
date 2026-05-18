import type { CookieOptions } from 'express';
import type { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';

export function getAccessTokenCookieOptions(
  config: ConfigService,
): CookieOptions {
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: parseCookieMaxAge(config.get<string>('JWT_EXPIRES_IN', '1d')),
  };
}

export function setAccessTokenCookie(
  res: { cookie: (name: string, value: string, options?: CookieOptions) => void },
  config: ConfigService,
  token: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions(config));
}

export function clearAccessTokenCookie(
  res: { clearCookie: (name: string, options?: CookieOptions) => void },
  config: ConfigService,
): void {
  const { maxAge: _maxAge, ...options } = getAccessTokenCookieOptions(config);
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
}

function parseCookieMaxAge(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (!match) {
    return 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}
