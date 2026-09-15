import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { sueldoRouter } from './sueldo.routes.js';
import { servicioRouter } from './servicio.routes.js';
import { metaRouter } from './meta.routes.js';
import { dashboardRouter } from './dashboard.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/sueldo', sueldoRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/metas', metaRouter);
apiRouter.use('/dashboard', dashboardRouter);
