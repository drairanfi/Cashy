import type { Request, Response, NextFunction } from 'express';
import {
  listServiciosUseCase,
  createServicioUseCase,
  updateServicioUseCase,
  deleteServicioUseCase,
} from '../services/servicio.service.js';

export async function listServicios(req: Request, res: Response, next: NextFunction) {
  try {
    const servicios = await listServiciosUseCase(req.user.id);
    res.json(servicios);
  } catch (err) {
    next(err);
  }
}

export async function createServicio(req: Request, res: Response, next: NextFunction) {
  try {
    const servicio = await createServicioUseCase(req.user.id, req.body);
    res.status(201).json(servicio);
  } catch (err) {
    next(err);
  }
}

export async function updateServicio(req: Request, res: Response, next: NextFunction) {
  try {
    const servicio = await updateServicioUseCase(req.user.id, req.params.id, req.body);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

export async function deleteServicio(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteServicioUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
