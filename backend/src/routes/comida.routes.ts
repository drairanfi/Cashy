import { Router } from 'express';
import { listComidas, createComida, deleteComida } from '../controllers/comida.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createComidaSchema } from '../schemas/comida.schema.js';

export const comidaRouter = Router();

comidaRouter.get('/', authenticate, listComidas);
comidaRouter.post('/', authenticate, validate(createComidaSchema), createComida);
comidaRouter.delete('/:id', authenticate, deleteComida);
