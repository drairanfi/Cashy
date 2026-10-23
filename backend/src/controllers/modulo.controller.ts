import type { Request, Response, NextFunction } from 'express';
import {
  deleteModuloDatosUseCase,
  listModulosUseCase,
  setModuloActivoUseCase,
} from '../services/modulo.service.js';

export async function listModulos(req: Request, res: Response, next: NextFunction) {
  try {
    const modulos = await listModulosUseCase(req.user.id);
    res.json(modulos);
  } catch (err) {
    next(err);
  }
}

export async function updateModulo(req: Request, res: Response, next: NextFunction) {
  try {
    const modulo = await setModuloActivoUseCase(req.user.id, req.params.clave, req.body.activo);
    res.json(modulo);
  } catch (err) {
    next(err);
  }
}

export async function deleteModuloDatos(req: Request, res: Response, next: NextFunction) {
  try {
    const modulo = await deleteModuloDatosUseCase(req.user.id, req.params.clave);
    res.json(modulo);
  } catch (err) {
    next(err);
  }
}
