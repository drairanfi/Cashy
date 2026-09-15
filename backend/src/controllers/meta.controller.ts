import type { Request, Response, NextFunction } from 'express';
import {
  listMetasUseCase,
  createMetaUseCase,
  updateMetaUseCase,
  deleteMetaUseCase,
} from '../services/meta.service.js';

export async function listMetas(req: Request, res: Response, next: NextFunction) {
  try {
    const metas = await listMetasUseCase(req.user.id);
    res.json(metas);
  } catch (err) {
    next(err);
  }
}

export async function createMeta(req: Request, res: Response, next: NextFunction) {
  try {
    const meta = await createMetaUseCase(req.user.id, req.body);
    res.status(201).json(meta);
  } catch (err) {
    next(err);
  }
}

export async function updateMeta(req: Request, res: Response, next: NextFunction) {
  try {
    const meta = await updateMetaUseCase(req.user.id, req.params.id, req.body);
    res.json(meta);
  } catch (err) {
    next(err);
  }
}

export async function deleteMeta(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteMetaUseCase(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
