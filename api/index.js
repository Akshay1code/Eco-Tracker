// Vercel serverless entry point.
// Vercel routes /api/* here (see vercel.json) and this handler delegates
// everything to the Express app defined in the backend package.
import { createApp } from '../backend/server.js';

let app;

async function getApp() {
  if (!app) {
    app = await createApp();
  }
  return app;
}

export default async function handler(req, res) {
  const expressApp = await getApp();
  return expressApp(req, res);
}
