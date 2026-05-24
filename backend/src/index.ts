import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { loadEnv } from './config/env';
import { logger } from './config/logging';
import { connectDb } from './db/client';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { apiRateLimit } from './middleware/rateLimit';
import { staticCacheHeaders } from './middleware/staticCache';
import { initSocketServer } from './realtime/socket-server';
import commentsRouter from './routes/comments';
import healthRouter from './routes/health';
import projectsRouter from './routes/projects';
import sampleRouter from './routes/sample';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';

loadEnv();

const app = express();
const port = process.env.PORT || '3000';

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(json());
app.use(requestLogger);
app.use(staticCacheHeaders);

app.use('/health', healthRouter);
app.use('/api/v1', apiRateLimit);
app.use('/api/v1', commentsRouter);
app.use('/api/v1', sampleRouter);
app.use('/api/v1', tasksRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

const server = http.createServer(app);

initSocketServer(server);

connectDb()
  .then(() => {
    server.listen(Number(port), () => {
      logger.info(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server due to DB connection error', err);
    process.exit(1);
  });

export default app;
