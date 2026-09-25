import { Router } from 'express';
import {
  listGimnasio,
  createGimnasio,
  deleteGimnasio,
} from '../controllers/gimnasio.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createGimnasioSchema } from '../schemas/gimnasio.schema.js';

export const gimnasioRouter = Router();

gimnasioRouter.get('/', authenticate, listGimnasio);
gimnasioRouter.post('/', authenticate, validate(createGimnasioSchema), createGimnasio);
gimnasioRouter.delete('/:id', authenticate, deleteGimnasio);
