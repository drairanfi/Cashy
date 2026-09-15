import type { Request, Response, NextFunction } from 'express';
import { getSueldoUseCase, upsertSueldoUseCase } from '../services/sueldo.service.js';

export async function getSueldo(req: Request, res: Response, next: NextFunction) {
  try {
    const sueldo = await getSueldoUseCase(req.user.id);
    res.json(sueldo);
  } catch (err) {
    next(err);
  }
}

export async function upsertSueldo(req: Request, res: Response, next: NextFunction) {
  try {
    const sueldo = await upsertSueldoUseCase(req.user.id, req.body.monto);
    res.json(sueldo);
  } catch (err) {
    next(err);
  }
}
