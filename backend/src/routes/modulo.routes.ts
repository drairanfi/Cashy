import { Router } from 'express';
import {
  deleteModuloDatos,
  listModulos,
  updateModulo,
} from '../controllers/modulo.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { updateModuloSchema } from '../schemas/modulo.schema.js';

export const moduloRouter = Router();

moduloRouter.get('/', authenticate, listModulos);
moduloRouter.patch('/:clave', authenticate, validate(updateModuloSchema), updateModulo);
moduloRouter.delete('/:clave', authenticate, deleteModuloDatos);
