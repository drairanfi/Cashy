import { Router } from 'express';
import { listGastos, createGasto, updateGasto, deleteGasto } from '../controllers/gasto.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createGastoSchema, updateGastoSchema } from '../schemas/gasto.schema.js';

export const gastoRouter = Router();

gastoRouter.get('/', authenticate, listGastos);
gastoRouter.post('/', authenticate, validate(createGastoSchema), createGasto);
gastoRouter.patch('/:id', authenticate, validate(updateGastoSchema), updateGasto);
gastoRouter.delete('/:id', authenticate, deleteGasto);
