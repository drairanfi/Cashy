import type { Request, Response, NextFunction } from 'express';
import {
  listCuentasUseCase,
  createCuentaUseCase,
  updateCuentaUseCase,
  deleteCuentaUseCase,
} from '../services/cuenta.service.js';

export async function listCuentas(req: Request, res: Response, next: NextFunction) {
  try {
    const cuentas = await listCuentasUseCase(req.user.id);
    res.json(cuentas);
  } catch (err) {
    next(err);
  }
}

export async function createCuenta(req: Request, res: Response, next: NextFunction) {
  try {
    const cuenta = await createCuentaUseCase(req.user.id, req.body);
    res.status(201).json(cuenta);
  } catch (err) {
    next(err);
  }
}

export async function updateCuenta(req: Request, res: Response, next: NextFunction) {
  try {
    const cuenta = await updateCuentaUseCase(req.user.id, req.params.id, req.body);
    res.json(cuenta);
  } catch (err) {
    next(err);
  }
}

export async function deleteCuenta(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCuentaUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
