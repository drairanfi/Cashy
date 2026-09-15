import { Router } from 'express';
import { getSueldo, upsertSueldo } from '../controllers/sueldo.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upsertSueldoSchema } from '../schemas/sueldo.schema.js';

export const sueldoRouter = Router();

sueldoRouter.get('/', authenticate, getSueldo);
sueldoRouter.put('/', authenticate, validate(upsertSueldoSchema), upsertSueldo);
