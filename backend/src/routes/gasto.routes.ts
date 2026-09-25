import { Router } from 'express';
import { listGastos, createGasto, deleteGasto } from '../controllers/gasto.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createGastoSchema } from '../schemas/gasto.schema.js';

export const gastoRouter = Router();

gastoRouter.get('/', authenticate, listGastos);
gastoRouter.post('/', authenticate, validate(createGastoSchema), createGasto);
gastoRouter.delete('/:id', authenticate, deleteGasto);
