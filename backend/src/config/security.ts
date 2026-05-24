import { CorsOptions } from 'cors';

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function parseOriginList(value: string | undefined) {
  if (!value) return DEFAULT_DEV_ORIGINS;

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');
}

export function getAllowedOrigins() {
  return parseOriginList(process.env.CORS_ORIGIN);
}

export function createCorsOptions(): CorsOptions {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Current-User-Id'],
    credentials: false,
  };
}
