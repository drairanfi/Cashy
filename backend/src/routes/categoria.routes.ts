import { Router } from 'express';
import {
  listCategorias,
  createCategoria,
  deleteCategoria,
} from '../controllers/categoria.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createCategoriaSchema } from '../schemas/categoria.schema.js';

export const categoriaRouter = Router();

categoriaRouter.get('/', authenticate, listCategorias);
categoriaRouter.post('/', authenticate, validate(createCategoriaSchema), createCategoria);
categoriaRouter.delete('/:id', authenticate, deleteCategoria);
