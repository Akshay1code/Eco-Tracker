import { MongoClient } from 'mongodb';

function normalizeMongoUri(uri) {
  return typeof uri === 'string' && uri.trim() ? uri.trim() : '';
}

const DEFAULT_URI = normalizeMongoUri(process.env.MONGODB_URI);
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'ecotrackerdb';
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000);

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
  const dnsHint =
    originalMessage.includes('querySrv ETIMEOUT') || originalMessage.includes('querySrv ENOTFOUND')
      ? '\n[eco-backend] Atlas DNS hint: your machine cannot resolve the Atlas SRV record. Try a different DNS server/network, disable VPN or filtering, or use the standard non-SRV Atlas connection string from the Atlas Connect > Drivers screen.'
      : '';
  const tlsHint = originalMessage.includes('tlsv1 alert internal error')
    ? '\n[eco-backend] Atlas TLS hint: check Atlas Network Access, confirm the cluster is not paused, and try again from a different network/VPN-disabled connection if your current network inspects HTTPS traffic.'
    : '';
  const enhanced = new Error(
    `${originalMessage}\n[eco-backend] Atlas checklist: verify Network Access IP allowlist, database username/password, and cluster availability.${dnsHint}${tlsHint}`
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

function assertAtlasConfiguration(uri) {
  if (!uri) {
    throw new Error(
      '[eco-backend] MONGODB_URI is required and must point to your MongoDB Atlas cluster.'
    );
  }

  if (!isAtlasUri(uri)) {
    throw new Error(
      `[eco-backend] Refusing to start with a non-Atlas MongoDB URI: ${uri}\n[eco-backend] Set MONGODB_URI in backend/.env to your Atlas connection string.`
    );
  }
}

export async function connectToDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (!clientPromise) {
    assertAtlasConfiguration(DEFAULT_URI);
    clientPromise = (async () => {
      try {
        const client = await connectClient(DEFAULT_URI);
        connectedUri = DEFAULT_URI;
        return client;
      } catch (primaryError) {
        throw primaryError;
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
