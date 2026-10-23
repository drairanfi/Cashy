import { Router } from 'express';
import {
  createRegistroModulo,
  deleteRegistroModulo,
  listRegistrosModulo,
} from '../controllers/registro-modulo-personalizado.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createRegistroModuloPersonalizadoSchema } from '../schemas/registro-modulo-personalizado.schema.js';

export const registroModuloPersonalizadoRouter = Router({ mergeParams: true });

registroModuloPersonalizadoRouter.get('/', authenticate, listRegistrosModulo);
registroModuloPersonalizadoRouter.post(
  '/',
  authenticate,
  validate(createRegistroModuloPersonalizadoSchema),
  createRegistroModulo,
);
registroModuloPersonalizadoRouter.delete('/:registroId', authenticate, deleteRegistroModulo);
