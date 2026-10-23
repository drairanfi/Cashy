import type { Request, Response, NextFunction } from 'express';
import {
  listGastosUseCase,
  createGastoUseCase,
  updateGastoUseCase,
  deleteGastoUseCase,
} from '../services/gasto.service.js';

export async function listGastos(req: Request, res: Response, next: NextFunction) {
  try {
    const gastos = await listGastosUseCase(req.user.id);
    res.json(gastos);
  } catch (err) {
    next(err);
  }
}

export async function createGasto(req: Request, res: Response, next: NextFunction) {
  try {
    const gasto = await createGastoUseCase(req.user.id, req.body);
    res.status(201).json(gasto);
  } catch (err) {
    next(err);
  }
}

export async function updateGasto(req: Request, res: Response, next: NextFunction) {
  try {
    const gasto = await updateGastoUseCase(req.user.id, req.params.id, req.body);
    res.json(gasto);
  } catch (err) {
    next(err);
  }
}

export async function deleteGasto(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteGastoUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
