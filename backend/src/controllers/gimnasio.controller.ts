import type { Request, Response, NextFunction } from 'express';
import {
  listGimnasioUseCase,
  createGimnasioUseCase,
  deleteGimnasioUseCase,
} from '../services/gimnasio.service.js';

export async function listGimnasio(req: Request, res: Response, next: NextFunction) {
  try {
    const registros = await listGimnasioUseCase(req.user.id);
    res.json(registros);
  } catch (err) {
    next(err);
  }
}

export async function createGimnasio(req: Request, res: Response, next: NextFunction) {
  try {
    const registro = await createGimnasioUseCase(req.user.id, req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
}

export async function deleteGimnasio(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteGimnasioUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
