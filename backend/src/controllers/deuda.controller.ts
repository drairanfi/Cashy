import type { Request, Response, NextFunction } from 'express';
import {
  listDeudasUseCase,
  createDeudaUseCase,
  getDeudaUseCase,
  pagarCuotaUseCase,
  deleteDeudaUseCase,
  calendarioUseCase,
} from '../services/deuda.service.js';

export async function listDeudas(req: Request, res: Response, next: NextFunction) {
  try {
    const deudas = await listDeudasUseCase(req.user.id);
    res.json(deudas);
  } catch (err) {
    next(err);
  }
}

export async function createDeuda(req: Request, res: Response, next: NextFunction) {
  try {
    const deuda = await createDeudaUseCase(req.user.id, req.body);
    res.status(201).json(deuda);
  } catch (err) {
    next(err);
  }
}

export async function getDeuda(req: Request, res: Response, next: NextFunction) {
  try {
    const deuda = await getDeudaUseCase(req.user.id, req.params.id);
    res.json(deuda);
  } catch (err) {
    next(err);
  }
}

export async function pagarCuota(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pagarCuotaUseCase(req.user.id, req.params.id, req.params.numero);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteDeuda(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteDeudaUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getCalendario(req: Request, res: Response, next: NextFunction) {
  try {
    const calendario = await calendarioUseCase(req.user.id);
    res.json(calendario);
  } catch (err) {
    next(err);
  }
}
