import { Router } from 'express';
import {
  listDeudas,
  createDeuda,
  getDeuda,
  pagarCuota,
  deleteDeuda,
  getCalendario,
} from '../controllers/deuda.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createDeudaSchema } from '../schemas/deuda.schema.js';

export const deudaRouter = Router();

deudaRouter.get('/', authenticate, listDeudas);
deudaRouter.post('/', authenticate, validate(createDeudaSchema), createDeuda);
deudaRouter.get('/calendario', authenticate, getCalendario);
deudaRouter.get('/:id', authenticate, getDeuda);
deudaRouter.post('/:id/cuotas/:numero/pagar', authenticate, pagarCuota);
deudaRouter.delete('/:id', authenticate, deleteDeuda);
