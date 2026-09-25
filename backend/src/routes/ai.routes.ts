import { Router } from 'express';
import { getAiStatus, getInsights, postChat, postActions } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { chatSchema, confirmActionsSchema } from '../schemas/ai.schema.js';

export const aiRouter = Router();

aiRouter.get('/status', authenticate, getAiStatus);
aiRouter.get('/insights', authenticate, getInsights);
aiRouter.post('/chat', authenticate, validate(chatSchema), postChat);
aiRouter.post('/actions', authenticate, validate(confirmActionsSchema), postActions);
