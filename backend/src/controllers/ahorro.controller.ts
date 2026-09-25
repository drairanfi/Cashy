import type { Request, Response, NextFunction } from 'express';
import {
  listAhorrosUseCase,
  createAhorroUseCase,
  aportarAhorroUseCase,
  deleteAhorroUseCase,
} from '../services/ahorro.service.js';

export async function listAhorros(req: Request, res: Response, next: NextFunction) {
  try {
    const ahorros = await listAhorrosUseCase(req.user.id);
    res.json(ahorros);
  } catch (err) {
    next(err);
  }
}

export async function createAhorro(req: Request, res: Response, next: NextFunction) {
  try {
    const ahorro = await createAhorroUseCase(req.user.id, req.body);
    res.status(201).json(ahorro);
  } catch (err) {
    next(err);
  }
}

export async function aportarAhorro(req: Request, res: Response, next: NextFunction) {
  try {
    const ahorro = await aportarAhorroUseCase(req.user.id, req.params.id, req.body);
    res.json(ahorro);
  } catch (err) {
    next(err);
  }
}

export async function deleteAhorro(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteAhorroUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
