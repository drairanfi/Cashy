import type { Request, Response, NextFunction } from 'express';
import {
  listComidasUseCase,
  createComidaUseCase,
  deleteComidaUseCase,
} from '../services/comida.service.js';

export async function listComidas(req: Request, res: Response, next: NextFunction) {
  try {
    const comidas = await listComidasUseCase(req.user.id);
    res.json(comidas);
  } catch (err) {
    next(err);
  }
}

export async function createComida(req: Request, res: Response, next: NextFunction) {
  try {
    const comida = await createComidaUseCase(req.user.id, req.body);
    res.status(201).json(comida);
  } catch (err) {
    next(err);
  }
}

export async function deleteComida(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteComidaUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
