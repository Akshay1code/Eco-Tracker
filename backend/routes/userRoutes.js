import { Router } from 'express';
import {
  getLeaderboard,
  getUserProfile,
  loginUser,
  saveUserProfile,
  signupUser,
  updateGoals,
  updateJournal,
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

  return router;
}
