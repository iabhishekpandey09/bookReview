# Book Review App

Full-stack book review application with a React + Vite frontend and an Express + MongoDB backend.

## Tech Stack
- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Auth: Google OAuth 2.0 + JWT (httpOnly cookie)
- Database: MongoDB

## Project Structure
- `client/` - React frontend
- `server/` - Express API server

## Prerequisites
- Node.js 18+
- npm
- MongoDB connection string
- Google OAuth credentials

## Environment Variables
Create `server/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

## Run Locally
Start backend:
```bash
cd server
npm run dev
```

Start frontend (new terminal):
```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Available Scripts
### Client (`client/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build

### Server (`server/package.json`)
- `npm start` - start server
- `npm run dev` - start server with nodemon
- `npm run seed` - seed database

## API Route Groups
- `/auth` - authentication routes
- `/api/books` - book listing/search/details
- `/api/shelves` - user shelf management
- `/api/reviews` - review CRUD

## Notes
- Frontend API calls use `baseURL: /api` and rely on Vite proxy config.
- Google login callback currently redirects to `http://localhost:5173`.
