import { Router } from 'express';
import { register, login, refresh, me } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/refresh', validate(refreshSchema), refresh);
authRouter.get('/me', authenticate, me);
