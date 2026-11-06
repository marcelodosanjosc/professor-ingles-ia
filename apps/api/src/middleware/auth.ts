import type { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../lib/http';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const SESSION_COOKIE_NAME = 'fl_session';

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
};

export function setSessionCookie(res: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  res.cookie(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  const token = cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    next(new HttpError(401, 'UNAUTHORIZED', 'Não autenticado'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (typeof payload !== 'object' || !payload || typeof payload.sub !== 'string') {
      next(new HttpError(401, 'UNAUTHORIZED', 'Token inválido'));
      return;
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new HttpError(401, 'UNAUTHORIZED', 'Sessão expirada'));
      return;
    }
    next(new HttpError(401, 'UNAUTHORIZED', 'Sessão inválida'));
  }
}
