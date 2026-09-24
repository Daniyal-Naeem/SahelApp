# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Sahal** — an e-commerce platform with a credit/wallet system. Three separate apps in one repo, no monorepo tooling (each has its own `package.json` / `node_modules`; install and run them independently).

| Dir | Stack | Purpose |
|---|---|---|
| `backend/` | Node + Express 4 + Mongoose 8 (CommonJS) | REST API, deployed to Vercel serverless |
| `frontend/` | React Native 0.82 + TS, Redux Toolkit, React Navigation | Customer mobile app (Android/iOS) |
| `admin-panel/` | React 18 + Vite + react-router (JSX, no TS) | Admin web dashboard, deployed to Vercel |

## Commands

Backend (`cd backend`):
- `npm run dev` — nodemon on `index.js` (port from `PORT`, normally 4000)
- `npm start` — plain node
- Seed/util scripts live in `backend/scripts/`: `npm run seed`, `create-admin`, `reset-admin`, `create-sample-products`, `sync-wallets`, `create-dummy-data`
- No tests configured.

Frontend (`cd frontend`):
- `npm start` (Metro), `npm run android`, `npm run android:windows` (PowerShell helper in `scripts/`), `npm run ios`
- `npm test` (Jest, `__tests__/`), `npm run lint`
- `postinstall` runs `patch-package` against `frontend/patches/` — never skip postinstall.

Admin panel (`cd admin-panel`): `npm run dev`, `npm run build`, `npm run preview`.

## Backend architecture

Layering is strict and consistent: `routes/*Route.js` → `controllers/*Controller.js` → `models/*Model.js`. Only middleware is `middleware/authMiddleware.js`, exporting `authenticate` (verifies `Bearer` JWT, reloads the user, rejects inactive accounts) and `authorize(...roles)` (roles: `user`, `vendor`, `admin`).

`index.js` mounts everything and, notably, mounts several routers at the bare `/api/` prefix (banners, gift cards, coupons, reviews, debug) rather than a namespaced path — route paths are spelled out in full inside those routers.

Credit system is versioned and **currently duplicated**:
- Legacy: `/api/credits/*` (`creditController`), balance stored on `userModel.credits`
- V1: `/api/v1/credits/*` (topup/transfer), `/api/v1/checkout/*`, `/api/v1/admin/credits/*`, balance stored in `walletModel`
- `utils/walletSync.js` + `npm run sync-wallets` reconcile the two. When touching balances, decide which store is authoritative and keep both in sync.

Mongo connection branches on `process.env.VERCEL`: serverless connects without `listen()` and reuses the cached connection; local dev connects then listens. `module.exports = app` is required by `vercel.json`.

## Conventions

- Backend is CommonJS, 4-space indent, no semicolon discipline enforced, no linter. Controllers are `async (req, res)` with a `try/catch` returning `res.status(...).json({ error: message })`. Success bodies are ad-hoc objects — match the shape of the neighbouring endpoint rather than inventing a new envelope.
- `userModel.toJSON()` strips `password`; rely on it instead of hand-picking fields.
- Frontend: functional components + hooks, Redux Toolkit slices in `src/store/`, API calls through `src/services/axios.ts` (an axios instance with a token request-interceptor and a 401 logout response-interceptor). Add new endpoints to `src/services/`, never call axios directly from a screen.
- Admin panel: one `.jsx` + one matching `.css` per page in `src/pages/`; all endpoints centralised as named API objects in `src/services/api.js`.
- Documentation habit in this repo is one Markdown file per feature/fix at the repo or app root (there are ~25). These are historical notes, often stale — verify against code before trusting them.

## Environment

- `backend/.env`: `MONGODB_URI`, `PORT`, `JWT_SECRET` (see `backend/.env.example`).
- `admin-panel/.env`: `VITE_API_URL`.
- Frontend base URL is **hardcoded** in `src/services/axios.ts` (`http://localhost:4000/api`) — Android emulators need `http://10.0.2.2:4000/api`.

## Security model

These were fixed deliberately - do not regress them:

- **All product writes require auth**:  need  or ,  needs .
- ** reads the role from the database**, not the JWT payload, and rejects a  whose  is not .
- ** is wrapped in **: anonymous callers may only create  or pending  accounts;  creation and vendor pre-approval require an authenticated admin.
- ** is a gateway webhook**, authenticated by an HMAC-SHA256 signature over the raw body in  (, secret ). The raw body is captured by the  hook on . Amount mismatches are rejected, not logged.
- **Secrets have no fallbacks**:  throws at boot if  or  is missing. Import them from there; never read  for a secret at a call site.
- **CORS matches origins exactly** from  /  /  (comma-separated) plus localhost defaults. No wildcard suffix matching, no NODE_ENV bypass.
- **helmet + rate limiting** are applied globally;  gets a 20-per-15-min budget.
- Route ordering matters on routers that mix literal and  paths -  and  are registered before  for this reason.
-  is the **single source of truth** for credit balances.  is a read-only mirror;  only ever writes wallet -> user, except when seeding a wallet that does not exist yet.

## Known hazards

Read these before changing related code:
- `backend/.env` and `admin-panel/.env` are **committed** even though `backend/.gitignore` lists `.env`. Do not add secrets to them; treat the current values as compromised.
- `routes/productsRoute.js` has **no auth on POST/PUT/DELETE** — product writes are public.
- `routes/debugRoute.js` exposes an unauthenticated `GET /api/debug-user` that probes a hardcoded admin credential.
- `POST /api/auth/register` accepts a caller-supplied `role`, allowing self-registration as `admin`.
- `POST /api/v1/credits/topup/confirm` is unauthenticated with signature verification left commented out; an amount mismatch is logged but not rejected.
- In `routes/reviewRoute.js`, `/reviews/:id` is registered before `/reviews/pending` and `/reviews/flagged`, so those admin routes are shadowed.
- JWT secret falls back to the literal `'your-secret-key-change-in-production'` when `JWT_SECRET` is unset.
- CORS allows any `*.vercel.app` origin, and allows everything when `NODE_ENV=development`.
