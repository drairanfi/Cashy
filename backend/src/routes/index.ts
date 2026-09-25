import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { sueldoRouter } from './sueldo.routes.js';
import { servicioRouter } from './servicio.routes.js';
import { metaRouter } from './meta.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { aiRouter } from './ai.routes.js';
import { gastoRouter } from './gasto.routes.js';
import { comidaRouter } from './comida.routes.js';
import { gimnasioRouter } from './gimnasio.routes.js';
import { ahorroRouter } from './ahorro.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/sueldo', sueldoRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/metas', metaRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/gastos', gastoRouter);
apiRouter.use('/comidas', comidaRouter);
apiRouter.use('/gimnasio', gimnasioRouter);
apiRouter.use('/ahorros', ahorroRouter);
