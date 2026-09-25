import { Router } from 'express';
import {
  listAhorros,
  createAhorro,
  aportarAhorro,
  deleteAhorro,
} from '../controllers/ahorro.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { aporteAhorroSchema, createAhorroSchema } from '../schemas/ahorro.schema.js';

export const ahorroRouter = Router();

ahorroRouter.get('/', authenticate, listAhorros);
ahorroRouter.post('/', authenticate, validate(createAhorroSchema), createAhorro);
ahorroRouter.post('/:id/aportes', authenticate, validate(aporteAhorroSchema), aportarAhorro);
ahorroRouter.delete('/:id', authenticate, deleteAhorro);
