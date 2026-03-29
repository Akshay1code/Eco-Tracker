import { MongoClient } from 'mongodb';

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'ecotrackerdb';
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000);
const ENABLE_LOCAL_FALLBACK = process.env.MONGODB_DISABLE_LOCAL_FALLBACK !== 'true';

let clientPromise = null;
let databaseInstance = null;
let connectedUri = null;

function isAtlasUri(uri) {
  return typeof uri === 'string' && (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net'));
}

function enhanceConnectionError(uri, error) {
  if (!isAtlasUri(uri)) {
    return error;
  }

  const originalMessage = error instanceof Error ? error.message : String(error);
  const enhanced = new Error(
    `${originalMessage}\n[eco-backend] Atlas checklist: verify Network Access IP allowlist, database username/password, and cluster availability.`
  );

  if (error instanceof Error && error.stack) {
    enhanced.stack = error.stack;
  }

  return enhanced;
}

async function connectClient(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
  });

  try {
    await client.connect();
  } catch (error) {
    throw enhanceConnectionError(uri, error);
  }
  return client;
}

export async function connectToDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const client = await connectClient(DEFAULT_URI);
        connectedUri = DEFAULT_URI;
        return client;
      } catch (primaryError) {
        if (!ENABLE_LOCAL_FALLBACK || DEFAULT_URI === LOCAL_FALLBACK_URI) {
          throw primaryError;
        }

        console.warn(
          `[eco-backend] database connection failed for configured URI, falling back to local MongoDB at ${LOCAL_FALLBACK_URI}`
        );
        const client = await connectClient(LOCAL_FALLBACK_URI);
        connectedUri = LOCAL_FALLBACK_URI;
        return client;
      }
    })().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  databaseInstance = client.db(DATABASE_NAME);
  return databaseInstance;
}

export function getDb() {
  if (!databaseInstance) {
    throw new Error('Database connection has not been initialized.');
  }

  return databaseInstance;
}

export { DATABASE_NAME, connectedUri };
