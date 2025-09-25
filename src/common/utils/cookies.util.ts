import { Response } from 'express';
import crypto from 'crypto';

export function setRefreshCookie(res: Response, token: string) {
  const name = process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';
  const maxAge = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS ?? 1000 * 60 * 60 * 24 * 7);
  const secure = (process.env.COOKIE_SECURE ?? 'true') === 'true';
  const sameSite = (process.env.COOKIE_SAMESITE ?? 'none') as 'lax'|'strict'|'none';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  res.cookie(name, token, {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    path: '/auth/refresh',
    maxAge,
  });
}

export function clearRefreshCookie(res: Response) {
  const name = process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';
  const secure = (process.env.COOKIE_SECURE ?? 'true') === 'true';
  const sameSite = (process.env.COOKIE_SAMESITE ?? 'none') as 'lax'|'strict'|'none';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  res.clearCookie(name, { httpOnly: true, secure, sameSite, domain, path: '/auth/refresh' });
}

export function issueCsrfCookie(res: Response) {
  const name = process.env.CSRF_COOKIE_NAME ?? 'csrf_token';
  const secure = (process.env.COOKIE_SECURE ?? 'true') === 'true';
  const sameSite = (process.env.COOKIE_SAMESITE ?? 'none') as 'lax'|'strict'|'none';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(name, token, {
    httpOnly: false,   // frontend must read it to send header
    secure,
    sameSite,
    domain,
    path: '/',         // available to your whole app
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE_MS ?? 1000 * 60 * 60 * 24 * 7),
  });
  return token;
}
