import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PORT } from './constants.js';
import { applyActivityTrigger, applyBatteryTrigger, applyTimeTrigger, getRecordDate } from './services/ecoEngine.js';
import { getDailyRecord, listDailyRecords, mutateDailyRecord } from './store/dailyRecordStore.js';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function normalizeUserId(payload = {}) {
  const raw = payload.userId || payload.email;
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handlePost(request, response, pathname) {
  const body = await readJsonBody(request);
  const userId = normalizeUserId(body);

  if (!userId) {
    sendJson(response, 400, { error: 'userId or email is required.' });
    return;
  }

  if (pathname === '/api/triggers/activity') {
    const { record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
      applyActivityTrigger(dailyRecord, body)
    );

    sendJson(response, 200, {
      success: true,
      trigger: 'activity',
      date: record.date,
      thresholdMeters: 20,
      ...result,
    });
    return;
  }

  if (pathname === '/api/triggers/time') {
    const { record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
      applyTimeTrigger(dailyRecord, body)
    );

    sendJson(response, 200, {
      success: true,
      trigger: 'time',
      date: record.date,
      ...result,
    });
    return;
  }

  if (pathname === '/api/triggers/battery') {
    const { record, result } = await mutateDailyRecord(userId, body.timestamp, (dailyRecord) =>
      applyBatteryTrigger(dailyRecord, body)
    );

    sendJson(response, 200, {
      success: true,
      trigger: 'battery',
      date: record.date,
      ...result,
    });
    return;
  }

  sendJson(response, 404, { error: 'Route not found.' });
}

async function handleGet(response, pathname, searchParams) {
  if (pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'eco-activity-backend',
      date: getRecordDate(),
    });
    return;
  }

  if (pathname === '/api/daily') {
    const userId = normalizeUserId({ userId: searchParams.get('userId') || searchParams.get('email') });
    if (!userId) {
      sendJson(response, 400, { error: 'userId or email query parameter is required.' });
      return;
    }

    const date = searchParams.get('date');
    if (date) {
      const record = await getDailyRecord(userId, date);
      sendJson(response, 200, { success: true, record });
      return;
    }

    const records = await listDailyRecords(userId);
    sendJson(response, 200, { success: true, records });
    return;
  }

  sendJson(response, 404, { error: 'Route not found.' });
}

export function createAppServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      if (request.method === 'OPTIONS') {
        sendJson(response, 204, {});
        return;
      }

      if (request.method === 'GET') {
        await handleGet(response, pathname, url.searchParams);
        return;
      }

      if (request.method === 'POST') {
        await handlePost(request, response, pathname);
        return;
      }

      sendJson(response, 405, { error: 'Method not allowed.' });
    } catch (error) {
      sendJson(response, 500, {
        error: 'Internal server error.',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  const server = createAppServer();
  server.listen(DEFAULT_PORT, () => {
    console.log(`[eco-backend] listening on http://localhost:${DEFAULT_PORT}`);
  });
}
