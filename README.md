# Eco Tracker

This project is split into two app folders:

- `frontend/` contains the React + Vite client
- `backend/` contains the Express + MongoDB API

## Run

From the project root you can now use:

```bash
npm run dev:backend
npm run dev:frontend
```

Or run each app directly.

From the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

From the backend folder:

```bash
cd backend
npm install
npm run dev
```

Frontend env lives in `frontend/.env`.
Backend env lives in `backend/.env`.

## Backend persistence

The backend now supports two persistence modes:

- `DATA_PROVIDER=auto` (default): use MongoDB when available, otherwise fall back to local JSON files in `backend/data/`
- `DATA_PROVIDER=mongo`: require MongoDB and fail fast if it is unavailable
- `DATA_PROVIDER=file`: always use the local JSON store

This keeps signup, login, activity tracking, goals, journal, and leaderboard working even when MongoDB is unavailable.
