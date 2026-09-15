import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { env } from './config/env.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(errorMiddleware);
