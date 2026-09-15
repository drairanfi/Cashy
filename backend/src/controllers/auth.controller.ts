import type { Request, Response, NextFunction } from 'express';
import {
  registerUseCase,
  loginUseCase,
  refreshUseCase,
  getMeUseCase,
} from '../services/auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUseCase(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUseCase(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = refreshUseCase(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getMeUseCase(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
