# Nebula Match — MERN Memory Game

Nebula Match is a full-stack memory card matching game built with MongoDB, Express, React, and Node.js. The codebase is written in **TypeScript** on both the server and client. Players flip cards to find matching cosmic symbols, earn scores based on speed and efficiency, and compete on a global leaderboard.

For a full breakdown of every technology, its role, and how the pieces connect, see **[TECH_STACK.md](./TECH_STACK.md)**.

## Architecture

```
nebula-match/
├── client/                 React SPA (Vite)
│   └── src/
│       ├── api/            Axios HTTP client
│       ├── components/     UI components
│       ├── context/        Auth state (React Context)
│       ├── hooks/          Game state hook
│       ├── pages/          Route pages
│       ├── styles/         Global and feature CSS
│       └── utils/          Pure game logic (tested)
├── server/                 Express REST API
│   └── src/
│       ├── config/         Environment and database
│       ├── controllers/    Request handlers
│       ├── middleware/     Auth, validation, errors
│       ├── models/         Mongoose schemas
│       ├── routes/         API route definitions
│       ├── services/       Business logic layer
│       └── utils/          Score calculation, errors
├── INSTRUCTIONS.md         Setup, API, and testing (this file)
└── TECH_STACK.md           Technologies and how they link together
```

### Backend layers

- **Routes** — HTTP endpoints and input validation rules
- **Controllers** — Parse requests and send responses
- **Services** — Business logic (auth, games, leaderboard)
- **Models** — MongoDB persistence via Mongoose

### Frontend layers

- **Pages** — One view per route
- **Components** — Reusable UI (cards, board, layout)
- **Context** — Authentication session
- **Hooks** — Memory game state and timer
- **Utils** — Pure functions for deck creation and matching

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or update `server/.env`)

## Setup

1. Install dependencies from the project root:

```bash
npm run install:all
```

2. Copy environment variables if needed:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set a strong `JWT_SECRET` for production.

3. Start MongoDB (pick one option):

**Option A — Docker (recommended):**

```bash
npm run mongo
```

**Option B — Homebrew (macOS):**

```bash
brew services start mongodb-community
```

If the API appears stuck on startup, MongoDB is not running. The server fails after 5 seconds with a clear error instead of hanging indefinitely.

## Running the application

### Development (API + React dev server)

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5001
- Vite proxies `/api` requests to the backend

### Production build

```bash
npm run build
npm run start
```

The Express server serves the built React app from `client/dist` when `NODE_ENV=production`.

## Game rules

| Difficulty | Pairs | Grid columns |
|------------|-------|--------------|
| Easy       | 6     | 3            |
| Medium     | 8     | 4            |
| Hard       | 10    | 5            |

1. Choose a difficulty on the Play page (requires login).
2. Click cards to flip them two at a time.
3. Matching pairs stay revealed; non-matches flip back after a short delay.
4. Complete all pairs to finish the mission.
5. Score is calculated on the server: higher base for harder modes, with penalties for moves and time. Minimum score on a win is 100.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/game/config` | No | Difficulty configuration |
| POST | `/api/game/submit` | Yes | Submit game result |
| GET | `/api/game/history` | Yes | User game history |
| GET | `/api/game/stats` | Yes | Aggregated user stats |
| GET | `/api/leaderboard` | No | Top scores (`?difficulty=easy`) |
| GET | `/api/leaderboard/recent` | No | Recent completed games |

## Testing

Run all tests from the project root:

```bash
npm test
```

### Server tests

- Score calculation utilities
- API integration with in-memory MongoDB (register, login, submit, leaderboard)

```bash
npm run test:server
```

### Client tests

- Deck creation, flip rules, and match resolution

```bash
npm run test:client
```

## Manual test checklist

1. **Register** — Create a new account at `/register`; confirm redirect to Play.
2. **Login / Logout** — Sign out and sign back in; token persists in `localStorage` under `nebula_token`.
3. **Play easy** — Complete a 6-pair board; win modal shows score; profile stats update.
4. **Play medium/hard** — Switch difficulty; grid size and pair count change.
5. **Leaderboard** — Your username appears after a completed game; filter by difficulty.
6. **Profile** — View games played, wins, best score, history table, and per-difficulty stats.
7. **Validation** — Submit with invalid data returns 400; unauthenticated submit returns 401.

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5001) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Allowed CORS origin |
| `NODE_ENV` | `development`, `test`, or `production` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing required environment variable` | Ensure `server/.env` exists with `JWT_SECRET` and `MONGODB_URI` |
| MongoDB connection refused | Start MongoDB or fix `MONGODB_URI` |
| CORS errors | Set `CLIENT_URL` to your frontend origin |
| Play page redirects to login | Sign in; game submission requires authentication |
| Tests hang | Ensure no other process holds the test database port; run with `npm run test:server` alone |

## Security notes for production

- Use a long random `JWT_SECRET`
- Serve over HTTPS
- Use a managed MongoDB instance
- Set `NODE_ENV=production`
- Restrict `CLIENT_URL` to your real domain

## Related documentation

- [TECH_STACK.md](./TECH_STACK.md) — Purpose of each technology and data flow between layers
