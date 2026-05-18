import { getDb, isFileStoreMode } from '../db.js';
import { createDefaultRecord, getRecordDate, hydrateRecord } from '../services/ecoEngine.js';
import {
  deleteDailyRecords as deleteStoredDailyRecords,
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

export async function deleteDailyRecordsForUser(userId) {
  if (isFileStoreMode()) {
    return deleteStoredDailyRecords(userId);
  }

  const result = await getActivitiesCollection().deleteMany({ userId });
  return result.deletedCount || 0;
}

export async function aggregateCarbonAndSteps(userId, period = 'all') {
  const records = await listDailyRecords(userId);
  
  if (records.length === 0) {
    return {
      period,
      totalSteps: 0,
      totalCarbonEmission: 0,
      totalCarbonSaved: 0,
      netCarbonImpact: 0,
      transportCarbon: 0,
      deviceCarbon: 0,
      chargingCarbon: 0,
      totalActiveTime: 0,
      totalActivityDistance: 0,
      totalXpEarned: 0,
      averageEcoScore: 0,
      recordCount: 0,
    };
  }

  let filtered = records;

  if (period === 'week') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10);
    filtered = records.filter((r) => r.date >= cutoffDate);
  } else if (period === 'month') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().slice(0, 10);
    filtered = records.filter((r) => r.date >= cutoffDate);
  }

  const totals = filtered.reduce(
    (acc, record) => ({
      totalSteps: acc.totalSteps + (Number(record.steps) || 0),
      totalCarbonEmission: acc.totalCarbonEmission + (Number(record.carbon_emission) || 0),
      totalCarbonSaved: acc.totalCarbonSaved + (Number(record.carbon_saved) || 0),
      netCarbonImpact: acc.netCarbonImpact + (Number(record.net_carbon_impact) || 0),
      transportCarbon: acc.transportCarbon + (Number(record.transport_carbon_emission) || 0),
      deviceCarbon: acc.deviceCarbon + (Number(record.device_carbon_emission) || 0),
      chargingCarbon: acc.chargingCarbon + (Number(record.charging_carbon_emission) || 0),
      totalActiveTime: acc.totalActiveTime + (Number(record.active_time) || 0),
      totalActivityDistance: acc.totalActivityDistance + (Number(record.activity_distance) || 0),
      totalXpEarned: acc.totalXpEarned + (Number(record.xp_earned) || 0),
      totalEcoScore: acc.totalEcoScore + (Number(record.eco_score) || 0),
    }),
    {
      totalSteps: 0,
      totalCarbonEmission: 0,
      totalCarbonSaved: 0,
      netCarbonImpact: 0,
      transportCarbon: 0,
      deviceCarbon: 0,
      chargingCarbon: 0,
      totalActiveTime: 0,
      totalActivityDistance: 0,
      totalXpEarned: 0,
      totalEcoScore: 0,
    }
  );

  return {
    period,
    totalSteps: totals.totalSteps,
    totalCarbonEmission: Number(totals.totalCarbonEmission.toFixed(6)),
    totalCarbonSaved: Number(totals.totalCarbonSaved.toFixed(6)),
    netCarbonImpact: Number(totals.netCarbonImpact.toFixed(6)),
    transportCarbon: Number(totals.transportCarbon.toFixed(6)),
    deviceCarbon: Number(totals.deviceCarbon.toFixed(6)),
    chargingCarbon: Number(totals.chargingCarbon.toFixed(6)),
    totalActiveTime: totals.totalActiveTime,
    totalActivityDistance: Number(totals.totalActivityDistance.toFixed(2)),
    totalXpEarned: totals.totalXpEarned,
    averageEcoScore: Number((totals.totalEcoScore / filtered.length).toFixed(2)),
    recordCount: filtered.length,
    dateRange: {
      start: filtered[filtered.length - 1]?.date,
      end: filtered[0]?.date,
    },
  };
}

export async function getCarbonMetrics(userId, date) {
  const record = await getDailyRecord(userId, date);

  return {
    date: record.date,
    steps: record.steps,
    carbonMetrics: {
      totalEmission: Number(record.carbon_emission.toFixed(6)),
      carbonSaved: Number(record.carbon_saved.toFixed(6)),
      netImpact: Number(record.net_carbon_impact.toFixed(6)),
      breakdown: {
        transport: Number(record.transport_carbon_emission.toFixed(6)),
        device: Number(record.device_carbon_emission.toFixed(6)),
        charging: Number(record.charging_carbon_emission.toFixed(6)),
      },
    },
    activityMetrics: {
      steps: record.steps,
      activeTime: record.active_time,
      distance: Number(record.activity_distance.toFixed(2)),
    },
    performance: {
      xpEarned: record.xp_earned,
      ecoScore: record.eco_score,
    },
  };
}
