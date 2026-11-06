import { Router } from 'express';
import { hash, verify } from '@node-rs/argon2';
import { rateLimit } from 'express-rate-limit';
import { registerSchema, loginSchema, type PublicUser } from '@fluencialab/shared';
import { prisma } from '../db';
import { env } from '../config/env';
import { HttpError } from '../lib/http';
import {
  requireAuth,
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth';

export const authRouter = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas. Tente novamente mais tarde.',
    },
  },
});

authRouter.use(authRateLimiter);

authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Este e-mail já está em uso');
    }

    const passwordHash = await hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        streak: {
          create: {
            current: 0,
            longest: 0,
          },
        },
      },
      include: {
        profile: { select: { id: true } },
      },
    });

    setSessionCookie(res, user.id);

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      hasProfile: user.profile !== null,
      createdAt: user.createdAt.toISOString(),
    };

    res.status(201).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: { select: { id: true } },
      },
    });

    if (!user) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
    }

    const validPassword = await verify(user.passwordHash, data.password);
    if (!validPassword) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
    }

    setSessionCookie(res, user.id);

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      hasProfile: user.profile !== null,
      createdAt: user.createdAt.toISOString(),
    };

    res.status(200).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: { select: { id: true } },
      },
    });

    if (!user) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Usuário não encontrado');
    }

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      hasProfile: user.profile !== null,
      createdAt: user.createdAt.toISOString(),
    };

    res.status(200).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});
