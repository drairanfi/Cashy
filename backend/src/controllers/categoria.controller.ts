import type { Request, Response, NextFunction } from 'express';
import {
  listCategoriasUseCase,
  createCategoriaUseCase,
  deleteCategoriaUseCase,
} from '../services/categoria.service.js';

export async function listCategorias(req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await listCategoriasUseCase(req.user.id);
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

export async function createCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const categoria = await createCategoriaUseCase(req.user.id, req.body);
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCategoriaUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
