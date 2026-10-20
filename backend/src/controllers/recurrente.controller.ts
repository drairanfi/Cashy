import type { Request, Response, NextFunction } from 'express';
import {
  listRecurrentesUseCase,
  createRecurrenteUseCase,
  updateRecurrenteUseCase,
  deleteRecurrenteUseCase,
  listPendientesUseCase,
  confirmarOcurrenciaUseCase,
  omitirOcurrenciaUseCase,
} from '../services/recurrente.service.js';

export async function listRecurrentes(req: Request, res: Response, next: NextFunction) {
  try {
    const reglas = await listRecurrentesUseCase(req.user.id);
    res.json(reglas);
  } catch (err) {
    next(err);
  }
}

export async function createRecurrente(req: Request, res: Response, next: NextFunction) {
  try {
    const regla = await createRecurrenteUseCase(req.user.id, req.body);
    res.status(201).json(regla);
  } catch (err) {
    next(err);
  }
}

export async function updateRecurrente(req: Request, res: Response, next: NextFunction) {
  try {
    const regla = await updateRecurrenteUseCase(req.user.id, req.params.id, req.body);
    res.json(regla);
  } catch (err) {
    next(err);
  }
}

export async function deleteRecurrente(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteRecurrenteUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listPendientes(req: Request, res: Response, next: NextFunction) {
  try {
    const pendientes = await listPendientesUseCase(req.user.id);
    res.json(pendientes);
  } catch (err) {
    next(err);
  }
}

export async function confirmarOcurrencia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await confirmarOcurrenciaUseCase(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function omitirOcurrencia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await omitirOcurrenciaUseCase(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
