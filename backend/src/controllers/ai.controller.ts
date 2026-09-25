import type { Request, Response, NextFunction } from 'express';
import { chat, generateInsights, isAiEnabled, runActions } from '../services/ai.service.js';
import type { ActionInput } from '../services/ai-tools.js';

export function getAiStatus(_req: Request, res: Response) {
  res.json({ enabled: isAiEnabled() });
}

export async function getInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const force = req.query.refresh === '1' || req.query.refresh === 'true';
    const data = await generateInsights(req.user.id, force);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function postChat(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await chat(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function postActions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await runActions(req.user.id, req.body.actions as ActionInput[]);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
