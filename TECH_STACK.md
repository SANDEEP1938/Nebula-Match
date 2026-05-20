# Nebula Match — Tech Stack Guide

This document describes every major technology in the Nebula Match project, what each one does, and how they connect to form a complete MERN application.

For install commands, environment variables, API endpoints, and testing, see **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**.

## Overview

The entire application is written in **TypeScript** (server and client) for type safety, better editor support, and fewer runtime errors.

Nebula Match follows the **MERN** pattern:

| Letter | Technology | Role |
|--------|------------|------|
| **M** | MongoDB | Database — stores users, game sessions, scores |
| **E** | Express | Backend API — HTTP routes, auth, business logic |
| **R** | React | Frontend UI — game board, pages, user interactions |
| **N** | Node.js | Runtime — runs the Express server |

The browser talks to React. React talks to Express over HTTP. Express talks to MongoDB through Mongoose.

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     Mongoose      ┌─────────────┐
│   Browser   │ ◄──────────────► │   Express   │ ◄──────────────► │   MongoDB   │
│  (React UI) │    /api/*        │  (Node.js)  │                  │  (Database) │
└─────────────┘                  └─────────────┘                  └─────────────┘
```

---

## Frontend (Client)

Located in `client/`. Built as a **Single Page Application (SPA)** that runs entirely in the browser after the initial page load.

### React

**Purpose:** UI library for building the interface from reusable components.

**Used for:**

- Game board and memory cards (`GameBoard`, `MemoryCard`)
- Pages: Home, Play, Login, Register, Leaderboard, Profile
- Shared layout (header, navigation, footer)
- Local game state (flipped cards, moves, timer) via hooks

**Why React:** Component-based structure keeps the game UI modular. State updates re-render only the parts of the screen that change (e.g. a card flip).

---

### React DOM

**Purpose:** Bridges React components to the real DOM in the browser.

**Used for:** Mounting the app into the `#root` element in `index.html` via `ReactDOM.createRoot()`.

**Link:** React defines *what* to show; React DOM handles *where* it appears in the page.

---

### React Router DOM

**Purpose:** Client-side routing — different URLs show different pages without full page reloads.

**Used for:**

| Route | Page |
|-------|------|
| `/` | Home |
| `/login` | Login |
| `/register` | Register |
| `/play` | Game (protected) |
| `/leaderboard` | Leaderboard |
| `/profile` | Profile (protected) |

**Link:** Wraps the app in `BrowserRouter`. `ProtectedRoute` redirects unauthenticated users to `/login` before they can play or view profile.

---

### Vite

**Purpose:** Development server and production build tool for the React app.

**Used for:**

- **Dev:** Fast hot module replacement (HMR) at `http://localhost:5173`
- **Build:** Bundles React into static files in `client/dist/`
- **Proxy:** Forwards `/api` requests to the Express server (`http://localhost:5001`) so the browser avoids CORS issues during development

**Link:** In development, the browser calls `http://localhost:5173/api/...`; Vite proxies that to Express. In production, Express serves the built files from `client/dist/` and handles `/api` on the same origin.

---

### Axios

**Purpose:** HTTP client for calling the REST API from the browser.

**Used for:**

- Register / login
- Fetch profile (`/api/auth/me`)
- Submit game results (`/api/game/submit`)
- Load leaderboard and game history

**Link:** Configured in `client/src/api/client.js`. Automatically attaches the JWT from `localStorage` as `Authorization: Bearer <token>` on every request.

---

### Vitest + jsdom

**Purpose:** Unit testing for frontend logic.

**Used for:** Testing pure game functions (deck creation, flip rules, match resolution) in `client/src/utils/gameLogic.js`.

**Link:** Runs separately from the server tests; does not need MongoDB or Express.

---

## Backend (Server)

Located in `server/`. A **REST API** that validates requests, runs business logic, and reads/writes the database.

### Node.js

**Purpose:** JavaScript runtime that executes the server outside the browser.

**Used for:** Running `server/src/index.js`, loading environment variables, handling async I/O (database, HTTP).

**Link:** Hosts Express. Uses ES modules (`"type": "module"` in `package.json`).

---

### Express

**Purpose:** Web framework for defining HTTP routes, middleware, and JSON APIs.

**Used for:**

| Mount path | Responsibility |
|------------|----------------|
| `/api/health` | Health check |
| `/api/auth` | Register, login, profile |
| `/api/game` | Config, submit score, history, stats |
| `/api/leaderboard` | Rankings, recent wins |

**Architecture inside Express:**

```
Request → Route → Middleware (auth, validation) → Controller → Service → Model → MongoDB
                                                      ↓
Response ← JSON ← Controller ← Service ← Model
```

**Link:** `createApp()` in `server/src/app.js` wires routes and error handling. `index.js` connects to MongoDB, then starts listening on port `5001`.

---

### Mongoose

**Purpose:** ODM (Object Document Mapper) — defines schemas and queries MongoDB using JavaScript objects.

**Used for:**

- **User** — username, email, hashed password, stats (`gamesPlayed`, `bestScore`, etc.)
- **GameSession** — each completed or abandoned game (moves, time, score, difficulty)

**Link:** Services call `User.create()`, `GameSession.find()`, aggregation pipelines for leaderboard. Replaces raw MongoDB driver calls with typed schemas and validation.

---

### MongoDB

**Purpose:** NoSQL document database — persistent storage for all application data.

**Used for:** Collections `users` and `gamesessions` (Mongoose pluralizes model names).

**Link:** Connection string from `MONGODB_URI` in `server/.env`. Started locally via Homebrew, `mongod`, or `docker compose` (see `docker-compose.yml`).

---

### jsonwebtoken (JWT)

**Purpose:** Creates and verifies signed tokens for stateless authentication.

**Used for:**

- Issuing a token on register/login
- `protect` middleware validates `Authorization: Bearer <token>` on protected routes
- Token payload contains user `id`; server loads full user from MongoDB

**Link:** Client stores token in `localStorage` (`nebula_token`). Axios sends it on every API call. Server never stores sessions in memory or DB — only validates the signature and expiry.

---

### bcryptjs

**Purpose:** One-way password hashing — passwords are never stored in plain text.

**Used for:** Hashing on user registration (`User` pre-save hook) and comparing on login (`comparePassword`).

**Link:** Auth service calls `loginUser` → `user.comparePassword(password)` before issuing JWT.

---

### express-validator

**Purpose:** Declarative validation rules on incoming request bodies and query params.

**Used for:** Email format, password length, difficulty enum, non-negative moves/time, etc.

**Link:** Runs as middleware before controllers. Failed validation returns `400` with field-level errors via `validate` middleware.

---

### cors

**Purpose:** Cross-Origin Resource Sharing — controls which frontend origins may call the API.

**Used for:** Allowing `CLIENT_URL` (default `http://localhost:5173`) in development.

**Link:** Browser enforces CORS on direct API calls. Vite proxy avoids this in dev; CORS matters when client and server run on different domains in production.

---

### dotenv

**Purpose:** Loads environment variables from `server/.env` into `process.env`.

**Used for:** `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV`.

**Link:** `server/src/config/env.js` reads and validates required variables before the app starts.

---

## DevOps & Tooling

### concurrently

**Purpose:** Runs multiple npm scripts in one terminal.

**Used for:** `npm run dev` starts both the Express server and Vite dev server together.

**Link:** Root `package.json` — orchestrates the full stack with a single command.

---

### Docker Compose

**Purpose:** Optional one-command MongoDB container for developers without a local MongoDB install.

**Used for:** `npm run mongo` → starts `mongo:7` on port `27017`.

**Link:** Same `MONGODB_URI` as local MongoDB; Express does not care whether MongoDB runs natively or in Docker.

---

## Testing Stack

| Tool | Layer | Purpose |
|------|-------|---------|
| **Jest** | Server | Test runner for API and utilities |
| **Supertest** | Server | HTTP assertions against Express without starting a real server port |
| **mongodb-memory-server** | Server | In-memory MongoDB for tests — no external DB required |
| **Vitest** | Client | Fast unit tests for game logic |
| **jsdom** | Client | Simulated browser DOM for tests |

---

## How a Typical Flow Links Everything

### 1. User registers and plays

```
Browser (React Register page)
  → Axios POST /api/auth/register
    → Express authRoutes → authController → authService
      → Mongoose User.create() → MongoDB
      ← JWT + user JSON
  ← Stored in React Context + localStorage

Browser (React Play page, useMemoryGame hook)
  → User flips cards (local React state only, no API yet)
  → On win: Axios POST /api/game/submit + Bearer token
    → Express protect middleware (JWT verify)
    → gameController → gameService
      → calculateScore() → GameSession.create() → User stats update
      → MongoDB
    ← score + updated stats
  ← Win modal shows score, Profile/Leaderboard can reflect new data
```

### 2. Leaderboard load

```
Browser (Leaderboard page)
  → Axios GET /api/leaderboard (public, no token)
    → leaderboardController → leaderboardService
      → Mongoose aggregation on GameSession + User lookup
      → MongoDB
    ← ranked entries JSON
  ← React renders table
```

### 3. Production deployment (single server)

```
User browser
  → https://yourdomain.com/          → Express static files (client/dist)
  → https://yourdomain.com/api/...   → Express API routes
                                        → Mongoose → MongoDB
```

React is pre-built into static HTML/JS/CSS. One Node process serves both the UI and the API.

---

## Summary Table

| Technology | Layer | Primary purpose |
|------------|-------|-----------------|
| MongoDB | Data | Persist users and game sessions |
| Mongoose | Data access | Schemas, queries, aggregations |
| Node.js | Runtime | Run server-side JavaScript |
| Express | API | HTTP routes and middleware |
| JWT | Security | Stateless authentication |
| bcryptjs | Security | Password hashing |
| express-validator | API | Input validation |
| cors | API | Cross-origin policy |
| dotenv | Config | Environment variables |
| React | UI | Components and interactive game |
| React Router | UI | Page navigation |
| Axios | UI | API communication |
| Vite | Build | Dev server, proxy, production bundle |
| Jest / Supertest | Quality | Backend tests |
| Vitest / jsdom | Quality | Frontend tests |
| concurrently | DX | Run client + server together |
| Docker Compose | DX | Optional MongoDB container |
| TypeScript | Language | Static typing for server and client |
| tsx | Server | Run and watch TypeScript in development |
| ts-jest | Server tests | Compile and run Jest with TypeScript |

For setup commands and API reference, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).
