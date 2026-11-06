import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiError } from '@fluencialab/shared';
import { HttpError } from '../lib/http';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const response: ApiError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.issues,
      },
    };
    res.status(400).json(response);
    return;
  }

  if (err instanceof HttpError) {
    const response: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.status).json(response);
    return;
  }

  // SyntaxError ao fazer parse de JSON no body
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status: unknown }).status === 400
  ) {
    const response: ApiError = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Corpo da requisição contém JSON inválido',
      },
    };
    res.status(400).json(response);
    return;
  }

  const isProd = env.NODE_ENV === 'production';
  if (!isProd && env.NODE_ENV !== 'test') {
    console.error('Erro não tratado na requisição:', err);
  }

  const response: ApiError = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProd
        ? 'Ocorreu um erro interno no servidor'
        : err instanceof Error
          ? err.message
          : 'Erro interno no servidor',
      ...(!isProd && err instanceof Error && err.stack ? { details: err.stack } : {}),
    },
  };

  res.status(500).json(response);
};

export function notFoundHandler(_req: Request, res: Response): void {
  const response: ApiError = {
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
    },
  };
  res.status(404).json(response);
}
