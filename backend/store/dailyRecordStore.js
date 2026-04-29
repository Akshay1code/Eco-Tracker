import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultRecord, getRecordDate, hydrateRecord } from '../services/ecoEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const dataFile = path.join(dataDirectory, 'daily-records.json');

function getRecordKey(userId, date) {
  return `${userId}::${date}`;
}

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeFile(dataFile, JSON.stringify({ records: {} }, null, 2));
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

export async function mutateDailyRecord(userId, timestamp, mutator) {
  const date = getRecordDate(timestamp);
  const store = await readStore();
  const key = getRecordKey(userId, date);
  const current = hydrateRecord(store.records[key], userId, date);
  const result = mutator(current);

  store.records[key] = current;
  await writeStore(store);

  return { date, record: current, result };
}

export async function getDailyRecord(userId, date) {
  const store = await readStore();
  const key = getRecordKey(userId, date);
  if (!store.records[key]) {
    return createDefaultRecord(userId, date);
  }
  return hydrateRecord(store.records[key], userId, date);
}

export async function listDailyRecords(userId) {
  const store = await readStore();
  return Object.entries(store.records)
    .filter(([key]) => key.startsWith(`${userId}::`))
    .map(([, record]) => record)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function listAllDailyRecords() {
  const store = await readStore();
  return Object.values(store.records).sort(
    (left, right) => right.userId.localeCompare(left.userId) || right.date.localeCompare(left.date)
  );
}
