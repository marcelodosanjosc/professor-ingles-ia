import { existsSync } from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { dashboardRouter } from './routes/dashboard';
import { teacherRouter } from './routes/teacher';
import { sessionsRouter } from './routes/sessions';
import { vocabRouter } from './routes/vocab';
import { pronunciationRouter } from './routes/pronunciation';
import { transcribeRouter } from './routes/transcribe';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // Configuração para proxies reversos (Nginx, Traefik, PaaS)
  app.set('trust proxy', 1);

  // Segurança de headers HTTP (desativa upgrade-insecure-requests quando acessado via HTTP)
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          upgradeInsecureRequests: null,
        },
      },
    }),
  );

  // Limite e parse do payload JSON (permite áudio base64)
  app.use(express.json({ limit: '10mb' }));

  // Parse de cookies
  app.use(cookieParser());

  // Origens autorizadas (env configurado + subdomínio de produção)
  const allowedOrigins = new Set([
    env.WEB_ORIGIN,
    'http://fluencialab.marcelocaldasdevops.com',
    'https://fluencialab.marcelocaldasdevops.com',
    'http://136.112.211.206:8080',
    'http://136.112.211.206',
  ]);
  const isAllowedOrigin = (origin?: string) => Boolean(origin && allowedOrigins.has(origin));

  // CORS manual restrito às origens autorizadas com credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin!);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  // Proteção CSRF simples para métodos não-GET (exigir Origin autorizada ou ausente em test)
  app.use((req, res, next) => {
    const isSafeMethod =
      req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
    if (isSafeMethod) {
      next();
      return;
    }

    const origin = req.headers.origin;

    // Em ambiente de teste, o header Origin pode ser omitido
    if (env.NODE_ENV === 'test' && !origin) {
      next();
      return;
    }

    if (!isAllowedOrigin(origin)) {
      res.status(403).json({
        error: {
          code: 'CSRF_FORBIDDEN',
          message: 'Origem da requisição não autorizada',
        },
      });
      return;
    }

    next();
  });

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Rotas da aplicação
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/teacher', teacherRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/vocab', vocabRouter);
  app.use('/api/pronunciation', pronunciationRouter);
  app.use('/api/transcribe', transcribeRouter);

  // Servir frontend React estático em produção (quando dist existir)
  const webDistPath =
    process.env.WEB_DIST_PATH || path.resolve(process.cwd(), '../web/dist');
  if (existsSync(webDistPath)) {
    app.use(express.static(webDistPath));
    app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
      res.sendFile(path.join(webDistPath, 'index.html'));
    });
  }

  // Tratamento de rota não encontrada (404)
  app.use(notFoundHandler);

  // Middleware global de tratamento de erros
  app.use(errorHandler);

  return app;
}
