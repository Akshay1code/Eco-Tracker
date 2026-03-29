import { fileURLToPath } from 'node:url';
import http from 'node:http';
import express from 'express';
import { DEFAULT_PORT } from './constants.js';
import { connectToDatabase, connectedUri } from './db.js';
import { ensureActivityIndexes } from './models/activityModel.js';
import { ensureUserIndexes } from './models/userModel.js';
import { createActivityRouter } from './routes/activityRoutes.js';
import { createUserRouter } from './routes/userRoutes.js';

async function initializeDataLayer() {
  await connectToDatabase();
  await Promise.all([ensureUserIndexes(), ensureActivityIndexes()]);
}

export async function createApp() {
  await initializeDataLayer();

  const app = express();

  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      response.sendStatus(204);
      return;
    }

    next();
  });

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
