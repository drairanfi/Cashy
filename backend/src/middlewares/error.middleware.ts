import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError.js';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
