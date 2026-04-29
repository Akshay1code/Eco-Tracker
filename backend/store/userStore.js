import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const dataFile = path.join(dataDirectory, 'users.json');

function createDuplicateError(field) {
  const error = new Error(`Duplicate value for ${field}.`);
  error.code = 11000;
  error.keyPattern = { [field]: 1 };
  return error;
}

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeFile(dataFile, JSON.stringify({ users: [] }, null, 2));
      return;
    }

    throw error;
  }
}

async function readStore() {
  await ensureStore();
  const contents = await readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

async function writeStore(store) {
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

export async function findStoredUserByEmailKey(emailKey) {
  const store = await readStore();
  return store.users.find((user) => user.emailKey === emailKey) || null;
}

export async function findStoredUserByNicknameKey(nicknameKey) {
  const store = await readStore();
  return store.users.find((user) => user.nicknameKey === nicknameKey) || null;
}

export async function findStoredUserByIdentifier(identifier) {
  const store = await readStore();
  return (
    store.users.find(
      (user) =>
        user.emailKey === identifier || user.nicknameKey === identifier || user.nameKey === identifier
    ) || null
  );
}

export async function insertStoredUser(document) {
  const store = await readStore();

  if (document.emailKey && store.users.some((user) => user.emailKey === document.emailKey)) {
    throw createDuplicateError('emailKey');
  }

  if (document.nicknameKey && store.users.some((user) => user.nicknameKey === document.nicknameKey)) {
    throw createDuplicateError('nicknameKey');
  }

  const nextDocument = {
    ...document,
    _id: randomUUID(),
  };

  store.users.push(nextDocument);
  await writeStore(store);
  return nextDocument;
}

export async function listStoredUsers() {
  const store = await readStore();
  return store.users;
}

export async function updateStoredUserByEmailKey(emailKey, updater) {
  const store = await readStore();
  const userIndex = store.users.findIndex((user) => user.emailKey === emailKey);
  if (userIndex < 0) {
    return null;
  }

  const currentUser = store.users[userIndex];
  const nextUser = updater({ ...currentUser });
  if (!nextUser) {
    return null;
  }

  store.users[userIndex] = {
    ...nextUser,
    _id: nextUser._id || currentUser._id,
  };
  await writeStore(store);
  return store.users[userIndex];
}
