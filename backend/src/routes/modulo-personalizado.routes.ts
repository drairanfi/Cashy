import { Router } from 'express';
import {
  createModuloPersonalizado,
  deleteModuloPersonalizado,
  listModulosPersonalizados,
  updateModuloPersonalizado,
} from '../controllers/modulo-personalizado.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  createModuloPersonalizadoSchema,
  updateModuloPersonalizadoSchema,
} from '../schemas/modulo-personalizado.schema.js';

export const moduloPersonalizadoRouter = Router();

moduloPersonalizadoRouter.get('/', authenticate, listModulosPersonalizados);
moduloPersonalizadoRouter.post(
  '/',
  authenticate,
  validate(createModuloPersonalizadoSchema),
  createModuloPersonalizado,
);
moduloPersonalizadoRouter.patch(
  '/:id',
  authenticate,
  validate(updateModuloPersonalizadoSchema),
  updateModuloPersonalizado,
);
moduloPersonalizadoRouter.delete('/:id', authenticate, deleteModuloPersonalizado);
