import { Router } from 'express';
import {
  getDailyActivity,
  getHealth,
  postActivityTrigger,
  postBatteryTrigger,
  postGoogleFitTrigger,
  postTimeTrigger,
  getCarbonAndStepsMetrics,
  getDailyCarbon,
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

  /**
   * POST /api/triggers/google-fit
   * Receives authoritative daily activity data fetched from the Google Fit
   * REST API by the browser (useGoogleFit hook) and applies it to the user's
   * eco record via applyGoogleFitSync in the eco-engine.
   *
   * Body: { userId, steps, distanceMeters, calories, activeMinutes, activityType, timestamp }
   */
  router.post(
    '/triggers/google-fit',
    asyncRoute(async (request, response) => {
      const result = await postGoogleFitTrigger(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  /**
   * GET /api/metrics/carbon-and-steps
   * Retrieves aggregated carbon emission and steps data with optional period filtering.
   *
   * Query params:
   * - userId: User ID (required)
   * - period: 'all', 'week', or 'month' (default: 'all')
   *
   * Returns: Aggregated metrics including total steps, carbon emission, carbon saved, etc.
   */
  router.get(
    '/metrics/carbon-and-steps',
    asyncRoute(async (request, response) => {
      const result = await getCarbonAndStepsMetrics(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  /**
   * GET /api/metrics/daily-carbon
   * Retrieves detailed carbon and activity metrics for a specific date.
   *
   * Query params:
   * - userId: User ID (required)
   * - date: Date in YYYY-MM-DD format (default: today)
   *
   * Returns: Detailed breakdown of carbon metrics, activity metrics, and performance data.
   */
  router.get(
    '/metrics/daily-carbon',
    asyncRoute(async (request, response) => {
      const result = await getDailyCarbon(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  return router;
}

