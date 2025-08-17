# Church Fellowship Backend (Node.js + Express + MongoDB)

Learning-focused backend for a church fellowship app suitable for 100-level students.

## Features (MVP)
- Auth: Register/Login with JWT
- Profiles: Basic user profile fields
- Groups: Units/ministries or cell fellowships
- Events: Basic event CRUD
- Attendance: (Scaffold placeholder)
- Announcements: (Scaffold placeholder)

## Tech Stack
- Node.js, Express
- MongoDB with Mongoose
- JWT Auth
- CORS, dotenv, morgan

## Quick Start
1) Install Node.js (v18+ recommended)
2) Create a `.env` file from `.env.example`
3) Install dependencies and start the server

### Environment Variables
Create `./.env` from `./.env.example`:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/church_fellowship
JWT_SECRET=please_change_me
JWT_EXPIRES_IN=7d
```

### Scripts
- `npm run dev` – start in dev mode (nodemon)
- `npm start` – start in production mode

### Install & Run
```
npm install
npm run dev
```

Server runs at: `http://localhost:4000`

Health check: `GET /health`

## Project Structure
```
church-fellowship-backend/
  .env.example
  .gitignore
  package.json
  README.md
  src/
    app.js
    server.js
    config/
      db.js
    controllers/
      auth.controller.js
    middleware/
      auth.js
    models/
      User.js
      Group.js
      Event.js
    routes/
      index.js
      auth.routes.js
      groups.routes.js
      events.routes.js
    utils/
      asyncHandler.js
```

## Learning Steps
1) Read `src/app.js` and `src/server.js` to understand Express setup.
2) Open `src/config/db.js` to see Mongo connection.
3) Explore routes in `src/routes/` and controllers in `src/controllers/`.
4) Try creating a user with `POST /api/auth/register` and logging in with `POST /api/auth/login`.
5) Inspect models in `src/models/` to see Mongoose schemas.

## Notes
- If `MONGO_URI` is missing, the server will still start but DB features will be disabled.
- This project is intentionally simplified and commented for learning.
