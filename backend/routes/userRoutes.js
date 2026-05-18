import { Router } from 'express';
import {
  getLeaderboard,
  getUserProfile,
  loginUser,
  removeUserProfile,
  saveUserProfile,
  signupUser,
  updateGoals,
  updateJournal,
  fetchDailyQuests,
  submitQuestCompletion,
  submitTransportCarbon,
  submitElectricityBill
} from '../controllers/userController.js';

function asyncRoute(handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (error) {
      next(error);
    }
  };
}

export function createUserRouter() {
  const router = Router();

  router.get(
    '/leaderboard',
    asyncRoute(async (request, response) => {
      const result = await getLeaderboard(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  router.get(
    '/profile',
    asyncRoute(async (request, response) => {
      const result = await getUserProfile(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  router.put(
    '/profile',
    asyncRoute(async (request, response) => {
      const result = await saveUserProfile(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.delete(
    '/profile',
    asyncRoute(async (request, response) => {
      const result = await removeUserProfile(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.put(
    '/goals',
    asyncRoute(async (request, response) => {
      const result = await updateGoals(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.put(
    '/journal',
    asyncRoute(async (request, response) => {
      const result = await updateJournal(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/signup',
    asyncRoute(async (request, response) => {
      const result = await signupUser(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/login',
    asyncRoute(async (request, response) => {
      const result = await loginUser(request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.get(
    '/quests',
    asyncRoute(async (request, response) => {
      const result = await fetchDailyQuests(request.query);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/quests/complete',
    asyncRoute(async (request, response) => {
      const result = await submitQuestCompletion(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/carbon/transport',
    asyncRoute(async (request, response) => {
      const result = await submitTransportCarbon(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  router.post(
    '/carbon/electricity',
    asyncRoute(async (request, response) => {
      const result = await submitElectricityBill(request.query, request.body);
      response.status(result.status).json(result.payload);
    })
  );

  return router;
}
