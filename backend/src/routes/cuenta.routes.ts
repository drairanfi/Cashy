import { Router } from 'express';
import {
  listCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta,
} from '../controllers/cuenta.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createCuentaSchema, updateCuentaSchema } from '../schemas/cuenta.schema.js';

export const cuentaRouter = Router();

cuentaRouter.get('/', authenticate, listCuentas);
cuentaRouter.post('/', authenticate, validate(createCuentaSchema), createCuenta);
cuentaRouter.patch('/:id', authenticate, validate(updateCuentaSchema), updateCuenta);
cuentaRouter.delete('/:id', authenticate, deleteCuenta);
