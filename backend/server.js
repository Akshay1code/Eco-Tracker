import { fileURLToPath } from 'node:url';
import http from 'node:http';
import cors from 'cors';
import express from 'express';
import { DEFAULT_PORT } from './constants.js';
import { connectToDatabase, connectedUri } from './db.js';
import { ensureActivityIndexes } from './models/activityModel.js';
import { ensureUserIndexes } from './models/userModel.js';
import { createActivityRouter } from './routes/activityRoutes.js';
import { createUserRouter } from './routes/userRoutes.js';

function getAllowedOrigins() {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://eco-trackerv20.vercel.app',
  ];
  const configuredOrigins = typeof process.env.CORS_ALLOWED_ORIGINS === 'string'
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`[eco-backend] CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  };
}

async function initializeDataLayer() {
  await connectToDatabase();
  await Promise.all([ensureUserIndexes(), ensureActivityIndexes()]);
}

export async function createApp() {
  await initializeDataLayer();

  const app = express();
  const corsOptions = createCorsOptions();

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(express.json());
  app.use('/api/users', createUserRouter());
  app.use('/api', createActivityRouter());

  app.use((request, response) => {
    response.status(404).json({ error: 'Route not found.' });
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({
        error: 'Invalid JSON body.',
        details: error.message,
      });
      return;
    }

    response.status(error?.statusCode || 500).json({
      error: error?.statusCode ? error.message : 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  });

  return app;
}

export async function createAppServer() {
  const app = await createApp();
  return http.createServer(app);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  try {
    const app = await createApp();
    app.listen(DEFAULT_PORT, () => {
      console.log(`[eco-backend] listening on http://localhost:${DEFAULT_PORT}`);
      if (connectedUri) {
        console.log(`[eco-backend] database connected: ${connectedUri}`);
      }
    });
  } catch (error) {
    console.error('[eco-backend] failed to start', error);
    process.exit(1);
  }
}
