import { Router } from 'express';
import {
  listRecurrentes,
  createRecurrente,
  updateRecurrente,
  deleteRecurrente,
  listPendientes,
  confirmarOcurrencia,
  omitirOcurrencia,
} from '../controllers/recurrente.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  createRecurrenteSchema,
  updateRecurrenteSchema,
} from '../schemas/recurrente.schema.js';

export const recurrenteRouter = Router();

recurrenteRouter.get('/', authenticate, listRecurrentes);
recurrenteRouter.post('/', authenticate, validate(createRecurrenteSchema), createRecurrente);
recurrenteRouter.get('/pendientes', authenticate, listPendientes);
recurrenteRouter.post('/ocurrencias/:id/confirmar', authenticate, confirmarOcurrencia);
recurrenteRouter.post('/ocurrencias/:id/omitir', authenticate, omitirOcurrencia);
recurrenteRouter.patch('/:id', authenticate, validate(updateRecurrenteSchema), updateRecurrente);
recurrenteRouter.delete('/:id', authenticate, deleteRecurrente);
