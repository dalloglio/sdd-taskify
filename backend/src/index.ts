import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { loadEnv } from './config/env';
import { connectDb } from './db/client';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { initSocketServer } from './realtime/socket-server';
import healthRouter from './routes/health';
import projectsRouter from './routes/projects';
import usersRouter from './routes/users';

loadEnv();

const app = express();
const port = process.env.PORT || '4000';

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(json());
app.use(requestLogger);

app.use('/health', healthRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

const server = http.createServer(app);

initSocketServer(server);

connectDb()
  .then(() => {
    server.listen(Number(port), () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server due to DB connection error', err);
    process.exit(1);
  });

export default app;
