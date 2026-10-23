import type { Request, Response, NextFunction } from 'express';
import {
  createModuloPersonalizadoUseCase,
  deleteModuloPersonalizadoUseCase,
  listModulosPersonalizadosUseCase,
  updateModuloPersonalizadoUseCase,
} from '../services/modulo-personalizado.service.js';

export async function listModulosPersonalizados(req: Request, res: Response, next: NextFunction) {
  try {
    const modulos = await listModulosPersonalizadosUseCase(req.user.id);
    res.json(modulos);
  } catch (err) {
    next(err);
  }
}

export async function createModuloPersonalizado(req: Request, res: Response, next: NextFunction) {
  try {
    const modulo = await createModuloPersonalizadoUseCase(req.user.id, req.body);
    res.status(201).json(modulo);
  } catch (err) {
    next(err);
  }
}

export async function updateModuloPersonalizado(req: Request, res: Response, next: NextFunction) {
  try {
    const modulo = await updateModuloPersonalizadoUseCase(req.user.id, req.params.id, req.body);
    res.json(modulo);
  } catch (err) {
    next(err);
  }
}

export async function deleteModuloPersonalizado(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteModuloPersonalizadoUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
