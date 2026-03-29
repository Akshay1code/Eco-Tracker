import { Router } from 'express';
import {
  getDailyActivity,
  getHealth,
  postActivityTrigger,
  postBatteryTrigger,
  postTimeTrigger,
} from '../controllers/activityController.js';

function asyncRoute(handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (error) {
      next(error);
    }
  };
}

export function createActivityRouter() {
  const router = Router();

  router.get(
    '/health',
    asyncRoute(async (_request, response) => {
      const result = await getHealth();
      response.status(result.status).json(result.payload);
    })
  );

  router.get(
    '/daily',
    asyncRoute(async (request, response) => {
      const result = await getDailyActivity(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/triggers/activity',
    asyncRoute(async (request, response) => {
      const result = await postActivityTrigger(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/triggers/time',
    asyncRoute(async (request, response) => {
      const result = await postTimeTrigger(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/triggers/battery',
    asyncRoute(async (request, response) => {
      const result = await postBatteryTrigger(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  return router;
}
