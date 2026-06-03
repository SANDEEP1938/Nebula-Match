# Nebula Match

Nebula Match is a full-stack memory card game built with the MERN stack and TypeScript .

- Match cosmic symbol pairs
- Compete on a global leaderboard
- Track your profile stats and match history
- Reset or change your password when needed

check the output at: -> https://nebula-match.onrender.com/

## Quick Start

### 1) Install dependencies

```bash
npm run install:all
```

### 2) Start MongoDB

Use one option:

```bash
npm run mongo
```

or (macOS Homebrew):

```bash
brew services start mongodb-community
```

### 3) Run the app

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5001`

## How To Play

1. Open the app at `http://localhost:5173`.
2. Create an account from the **Register** page (or log in if you already have one).
3. Go to **Play**.
4. Select difficulty:
   - Easy: 6 pairs
   - Medium: 8 pairs
   - Hard: 10 pairs
5. Click cards to flip two at a time.
6. If the symbols match, the pair stays revealed.
7. If they do not match, both cards flip back after a short delay.
8. Match all pairs to complete the round.
9. Your score is saved automatically and shown in leaderboard/profile.

### Scoring Basics

- Harder difficulties start with higher base score
- More moves reduce score
- More time reduces score
- Minimum winning score is 100

## Main Features

- Authentication (register/login)
- Forgot/reset password flow
- Change password while logged in
- Real-time game board with timer and move counter
- Server-side score calculation
- Leaderboard (global + recent wins)
- Profile dashboard with personal stats/history

## Useful Commands

```bash
npm run dev
npm run test
npm run build
npm run start
```

## Deploy Backend on Render

### Option A (recommended): API only — Root Directory = `server`

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

The API is available at `https://your-service.onrender.com/api/health`. Deploy the React app separately (static site) and set `VITE_API_URL` to your Render API URL.

### Option A2: API + frontend on one Render service

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run build:with-client` |
| **Start Command** | `npm start` |

Serves the game at your Render URL root once the client build is included.

### Option B: Root Directory = repo root (monorepo)

| Setting | Value |
|---------|-------|
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm run render:build` |
| **Start Command** | `npm run start --prefix server` |

### If the build fails on client TypeScript (`@types/react`, `vitest`, JSX errors)

Render was probably using **`npm run build`** at the repo root, which also builds the frontend. The API service only needs the server.

1. Switch to **Option A** or **Option B** above (use `render:build`, not `npm run build`).
2. Push the latest code (client `build` uses `vite build` only; types are in `dependencies`).
3. **Clear build cache & deploy** on Render.

Do **not** use `npm install; npm run build` at the repo root for a Web Service API.

### If you still see `Cannot find module 'cors'`

That means dependencies were not installed in `server/` before `tsc` ran.

1. Confirm **Root Directory** is exactly `server` (most common fix).
2. Push latest code (types moved to `dependencies` in `server/package.json`).
3. Use **Clear build cache & deploy** on Render.
4. Fallback (skip TypeScript build on Render):

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install` |
| **Start Command** | `npm run start:ts` |

Required environment variables:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
CLIENT_URL=https://your-frontend-domain
NODE_ENV=production
```

## Documentation

- Setup, API, and test details: `INSTRUCTIONS.md`
- Tech stack and architecture details: `TECH_STACK.md`
