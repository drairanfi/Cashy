import { Router } from 'express';
import {
  listServicios,
  createServicio,
  updateServicio,
  deleteServicio,
} from '../controllers/servicio.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createServicioSchema, updateServicioSchema } from '../schemas/servicio.schema.js';

export const servicioRouter = Router();

servicioRouter.get('/', authenticate, listServicios);
servicioRouter.post('/', authenticate, validate(createServicioSchema), createServicio);
servicioRouter.patch('/:id', authenticate, validate(updateServicioSchema), updateServicio);
servicioRouter.delete('/:id', authenticate, deleteServicio);
