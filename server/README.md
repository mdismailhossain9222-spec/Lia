# LIA API — members & reservations

Hardened Express backend for the LIA restaurant site: cookie-based member
sessions with rotating refresh tokens, bcrypt password hashing, brute-force
lockouts, strict validation and rate limiting.

## Quick start

```bash
cd server
npm install
cp .env.example .env   # or export the variables below
npm run dev            # http://localhost:4000
```

The API stores data in a local `data.json` (atomic writes) so it runs anywhere
with zero setup. Swap `src/lib.js → store` for Postgres/Prisma in production —
routes don't change.

## Environment

| Variable              | Default                 | Notes                              |
| --------------------- | ----------------------- | ---------------------------------- |
| `PORT`                | `4000`                  |                                    |
| `CLIENT_ORIGIN`       | `http://localhost:5173` | Comma-separated allowlist          |
| `JWT_ACCESS_SECRET`   | — (dev fallback)        | **Required in prod**, 32+ chars    |
| `JWT_REFRESH_SECRET`  | — (dev fallback)        | **Required in prod**, 32+ chars    |
| `DATA_FILE`           | `./data.json`           |                                    |

Generate secrets: `openssl rand -hex 32`

## Endpoints

| Method | Path                     | Auth      | Description                              |
| ------ | ------------------------ | --------- | ---------------------------------------- |
| POST   | `/api/auth/register`     | —         | Create account, starts session (20 req/15m throttle) |
| POST   | `/api/auth/login`        | —         | Sign in; locks 15 min after 5 failures   |
| POST   | `/api/auth/refresh`      | cookie    | Rotate refresh token (reuse = revoked)   |
| POST   | `/api/auth/logout`       | —         | Revoke refresh token, clear cookies      |
| GET    | `/api/auth/me`           | member    | Current member                           |
| POST   | `/api/reservations`      | optional  | Hold a table (honeypot field: `company`) |
| GET    | `/api/reservations/mine` | member    | List own reservations                    |
| DELETE | `/api/reservations/:id`  | member    | Cancel own reservation                   |
| POST   | `/api/orders`            | optional  | Place an order — totals recomputed server-side |
| GET    | `/api/orders/mine`       | member    | Order history                            |
| GET    | `/api/health`            | —         | Liveness probe                           |

**Ordering security:** the client sends only item IDs + quantities. Prices and
totals live exclusively in `MENU_PRICES` (`src/lib.js`) and are recomputed on
every order — tampered client prices simply fail validation.

## Security checklist (implemented)

- **bcrypt (12 rounds)** password hashing; passwords never logged or returned
- **JWT access (15 min) + rotating refresh (7 d)** in `httpOnly`, `SameSite=Strict`,
  `Secure` (prod) cookies; refresh cookie scoped to `/api/auth` only
- **Account lockout** after 5 failed logins + generic 401 messages + dummy-hash
  comparison for uniform timing (no account-enumeration)
- **Rate limiting**: 300/15 min global API, 20/15 min on credential endpoints
- **Helmet**: CSP, HSTS, `nosniff`, frame guard; `X-Powered-By` disabled
- **Strict CORS** origin allowlist with credentials; `authorization: Bearer`
  supported for non-browser clients
- **Zod validation** on every body + field sanitization + 10 kb body cap
- **Honeypot** anti-spam on reservations (fake-200 for bots)
- **Centralized error handler** — no stack traces leak in production

## Wiring the frontend

Set `VITE_API_URL=http://localhost:4000` in the frontend `.env`. Without it the
site runs in a fully client-side demo auth mode (hashed passwords, session
expiry, lockouts) — it upgrades to this API automatically when the URL is set.

## Production hardening (next steps)

- Managed Postgres + migrations; move `refreshTokens` to Redis with TTL
- HTTPS everywhere (terminate at proxy), `trust proxy` already configured
- Secrets via a manager (Doppler/Vault/KMS); rotate quarterly
- Structured logging (pino) + alerting on 401/429 spikes
- Dependency audits in CI (`npm audit`, Socket), Dependabot enabled
