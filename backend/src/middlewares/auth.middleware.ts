import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
