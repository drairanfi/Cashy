import { Router } from 'express';
import { listMetas, createMeta, updateMeta, deleteMeta } from '../controllers/meta.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createMetaSchema, updateMetaSchema } from '../schemas/meta.schema.js';

export const metaRouter = Router();

metaRouter.get('/', authenticate, listMetas);
metaRouter.post('/', authenticate, validate(createMetaSchema), createMeta);
metaRouter.patch('/:id', authenticate, validate(updateMetaSchema), updateMeta);
metaRouter.delete('/:id', authenticate, deleteMeta);
