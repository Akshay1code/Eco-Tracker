import './bootstrapEnv.js';
import { MongoClient } from 'mongodb';

function normalizeMongoUri(uri) {
  return typeof uri === 'string' && uri.trim() ? uri.trim() : '';
}

function normalizeProvider(value) {
  const provider = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ['auto', 'mongo', 'file'].includes(provider) ? provider : 'auto';
}

const DEFAULT_URI = normalizeMongoUri(process.env.MONGODB_URI);
const FALLBACK_URI = normalizeMongoUri(process.env.MONGODB_URI_FALLBACK);
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'ecotrackerdb';
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000);
const DATA_PROVIDER = normalizeProvider(process.env.DATA_PROVIDER);

let clientPromise = null;
let databaseInstance = null;
let connectedUri = null;
let connectionState = 'idle';
let lastConnectionError = null;
let persistenceMode = DATA_PROVIDER === 'file' ? 'file' : 'mongo';

function isMongoUri(uri) {
  return typeof uri === 'string' && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
}

function isAtlasUri(uri) {
  return typeof uri === 'string' && (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net'));
}

function canUseFileFallback() {
  return DATA_PROVIDER !== 'mongo';
}

function activateFileStore(reason = null) {
  clientPromise = null;
  databaseInstance = null;
  connectedUri = null;
  connectionState = 'connected';
  persistenceMode = 'file';
  lastConnectionError = reason;
}

function shouldTryFallback(error) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('querySrv ETIMEOUT') ||
    message.includes('querySrv ENOTFOUND') ||
    message.includes('querySrv ECONNREFUSED') ||
    message.includes('ECONNRESET') ||
    message.includes('ECONNREFUSED') ||
    message.includes('tlsv1 alert internal error')
  );
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

function assertPrimaryConfiguration(uri) {
  if (!uri) {
    throw new Error(
      '[eco-backend] MONGODB_URI is required when DATA_PROVIDER is set to "mongo".'
    );
  }

  if (!isMongoUri(uri)) {
    throw new Error(
      `[eco-backend] MONGODB_URI must be a valid MongoDB connection string. Received: ${uri}`
    );
  }
}

function assertFallbackConfiguration(uri) {
  if (!uri) {
    return;
  }

  if (isMongoUri(uri)) {
    return;
  }

  throw new Error(
    `[eco-backend] MONGODB_URI_FALLBACK must be a valid MongoDB connection string. Received: ${uri}`
  );
}

export async function connectToDatabase() {
  if (DATA_PROVIDER === 'file') {
    activateFileStore(null);
    return null;
  }

  if (persistenceMode === 'file') {
    return null;
  }

  if (databaseInstance) {
    return databaseInstance;
  }

  if (!clientPromise) {
    if (!DEFAULT_URI) {
      if (canUseFileFallback()) {
        activateFileStore('[eco-backend] MONGODB_URI not configured. Using local JSON storage.');
        return null;
      }

      assertPrimaryConfiguration(DEFAULT_URI);
    }

    assertPrimaryConfiguration(DEFAULT_URI);
    assertFallbackConfiguration(FALLBACK_URI);
    connectionState = 'connecting';
    persistenceMode = 'mongo';
    lastConnectionError = null;
    clientPromise = (async () => {
      try {
        const client = await connectClient(DEFAULT_URI);
        connectedUri = DEFAULT_URI;
        connectionState = 'connected';
        return client;
      } catch (primaryError) {
        if (FALLBACK_URI && FALLBACK_URI !== DEFAULT_URI && shouldTryFallback(primaryError)) {
          try {
            const client = await connectClient(FALLBACK_URI);
            connectedUri = FALLBACK_URI;
            connectionState = 'connected';
            lastConnectionError = null;
            return client;
          } catch (fallbackError) {
            if (canUseFileFallback()) {
              activateFileStore(
                fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
              );
              return null;
            }

            connectionState = 'error';
            lastConnectionError =
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
            throw fallbackError;
          }
        }

        if (canUseFileFallback()) {
          activateFileStore(primaryError instanceof Error ? primaryError.message : String(primaryError));
          return null;
        }

        connectionState = 'error';
        lastConnectionError = primaryError instanceof Error ? primaryError.message : String(primaryError);
        throw primaryError;
      }
    })().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  if (!client) {
    return null;
  }

  databaseInstance = client.db(DATABASE_NAME);
  return databaseInstance;
}

export function getDb() {
  if (!databaseInstance) {
    throw new Error('Database connection has not been initialized.');
  }

  return databaseInstance;
}

export function isFileStoreMode() {
  return persistenceMode === 'file';
}

export function getDatabaseStatus() {
  if (persistenceMode === 'file') {
    return {
      status: 'connected',
      mode: 'file',
      label: 'Local JSON Store',
      error: lastConnectionError,
    };
  }

  if (connectionState === 'connected' && connectedUri) {
    if (connectedUri.startsWith('mongodb+srv://') || connectedUri.includes('mongodb.net')) {
      return {
        status: 'connected',
        mode: 'atlas',
        label: 'MongoDB Atlas',
        error: null,
      };
    }

    if (connectedUri.includes('127.0.0.1') || connectedUri.includes('localhost')) {
      return {
        status: 'connected',
        mode: 'local',
        label: 'Local MongoDB',
        error: null,
      };
    }

    return {
      status: 'connected',
      mode: 'custom',
      label: 'MongoDB',
      error: null,
    };
  }

  return {
    status: connectionState === 'error' ? 'disconnected' : connectionState,
    mode: 'unknown',
    label:
      connectionState === 'connecting'
        ? 'Database connecting'
        : connectionState === 'error'
          ? 'Database unavailable'
          : 'Database not initialized',
    error: lastConnectionError,
  };
}

export { DATABASE_NAME, connectedUri };
