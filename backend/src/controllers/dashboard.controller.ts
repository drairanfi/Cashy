import type { Request, Response, NextFunction } from 'express';
import { getDashboardUseCase } from '../services/dashboard.service.js';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const resumen = await getDashboardUseCase(req.user.id);
    res.json(resumen);
  } catch (err) {
    next(err);
  }
}
