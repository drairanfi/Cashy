import type { Request, Response, NextFunction } from 'express';
import {
  createRegistroModuloUseCase,
  deleteRegistroModuloUseCase,
  listRegistrosModuloUseCase,
} from '../services/registro-modulo-personalizado.service.js';

export async function listRegistrosModulo(req: Request, res: Response, next: NextFunction) {
  try {
    const registros = await listRegistrosModuloUseCase(req.user.id, req.params.moduloId);
    res.json(registros);
  } catch (err) {
    next(err);
  }
}

export async function createRegistroModulo(req: Request, res: Response, next: NextFunction) {
  try {
    const registro = await createRegistroModuloUseCase(req.user.id, req.params.moduloId, req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
}

export async function deleteRegistroModulo(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteRegistroModuloUseCase(req.user.id, req.params.moduloId, req.params.registroId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
