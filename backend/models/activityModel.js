import { getDb, isFileStoreMode } from '../db.js';
import { createDefaultRecord, getRecordDate, hydrateRecord } from '../services/ecoEngine.js';
import {
  getDailyRecord as getStoredDailyRecord,
  listAllDailyRecords,
  listDailyRecords as listStoredDailyRecords,
  mutateDailyRecord as mutateStoredDailyRecord,
} from '../store/dailyRecordStore.js';

const ACTIVITIES_COLLECTION = 'activities';

function getActivitiesCollection() {
  return getDb().collection(ACTIVITIES_COLLECTION);
}

function sanitizeActivityDocument(document) {
  if (!document) {
    return null;
  }

  const { _id, ...record } = document;
  return record;
}

export async function ensureActivityIndexes() {
  if (isFileStoreMode()) {
    return;
  }

  const collection = getActivitiesCollection();
  await collection.createIndex({ userId: 1, date: 1 }, { unique: true, name: 'uniq_activity_user_date' });
  await collection.createIndex({ userId: 1, date: -1 }, { name: 'idx_activity_user_date_desc' });
}

export async function mutateDailyRecord(userId, timestamp, mutator) {
  if (isFileStoreMode()) {
    const fileResult = await mutateStoredDailyRecord(userId, timestamp, (record) => {
      const previousRecord = hydrateRecord({ ...record }, userId, record.date);
      const result = mutator(record);
      return { previousRecord, result };
    });

    return {
      date: fileResult.date,
      previousRecord: fileResult.result.previousRecord,
      record: fileResult.record,
      result: fileResult.result.result,
    };
  }

  const date = getRecordDate(timestamp);
  const collection = getActivitiesCollection();
  const existing = await collection.findOne({ userId, date });
  const previousRecord = existing ? hydrateRecord(sanitizeActivityDocument(existing), userId, date) : null;
  const currentRecord = hydrateRecord(sanitizeActivityDocument(existing), userId, date);
  const result = mutator(currentRecord);

  await collection.updateOne(
    { userId, date },
    {
      $set: {
        ...currentRecord,
        userId,
        date,
      },
    },
    { upsert: true }
  );

  return {
    date,
    previousRecord,
    record: currentRecord,
    result,
  };
}

export async function getDailyRecord(userId, date) {
  if (isFileStoreMode()) {
    return getStoredDailyRecord(userId, date);
  }

  const existing = await getActivitiesCollection().findOne({ userId, date });
  if (!existing) {
    return createDefaultRecord(userId, date);
  }

  return hydrateRecord(sanitizeActivityDocument(existing), userId, date);
}

export async function listDailyRecords(userId) {
  if (isFileStoreMode()) {
    return listStoredDailyRecords(userId);
  }

  const documents = await getActivitiesCollection()
    .find({ userId })
    .sort({ date: -1 })
    .toArray();

  return documents.map((document) => hydrateRecord(sanitizeActivityDocument(document), userId, document.date));
}

export async function listActivityRecordsForLeaderboard() {
  if (isFileStoreMode()) {
    return listAllDailyRecords();
  }

  const documents = await getActivitiesCollection()
    .find(
      {},
      {
        projection: {
          userId: 1,
          date: 1,
          carbon_emission: 1,
          xp_earned: 1,
          steps: 1,
          active_time: 1,
          activity_distance: 1,
        },
      }
    )
    .sort({ userId: 1, date: -1 })
    .toArray();

  return documents.map((document) => sanitizeActivityDocument(document));
}
