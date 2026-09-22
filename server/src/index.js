/* ------------------------------------------------------------------ */
/*  LIA API — bootstrap                                                 */
/*  Hardened Express server: Helmet, strict CORS loop, rate limiting,   */
/*  10kb JSON bodies, cookie sessions, centralized errors.              */
/* ------------------------------------------------------------------ */
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import { config, errorHandler, notFound } from './lib.js'
import { authRouter, orderRouter, reservationRouter } from './routes.js'

const app = express()

app.set('trust proxy', 1) // behind TLS-terminating proxy (nginx/CF)
app.disable('x-powered-by')

/* security headers: CSP, HSTS, nosniff, frameguard… */
app.use(
  helmet({
    contentSecurityPolicy: { useDefaults: true },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // images served to the SPA
  })
)

/* strict origin allowlist with credentials */
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || config.clientOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })
)

app.use(express.json({ limit: '10kb' })) // tiny bodies only — no payload bombs
app.use(cookieParser())

/* global API throttle */
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please slow down' },
  })
)

/* strict throttle on credential endpoints (brute-force defense) */
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please wait a few minutes' },
})
app.use('/api/auth/login', credentialsLimiter)
app.use('/api/auth/register', credentialsLimiter)

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'lia-api', time: new Date().toISOString() })
)

app.use('/api/auth', authRouter)
app.use('/api/reservations', reservationRouter)
app.use('/api/orders', orderRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`LIA api listening on :${config.port} (${config.isProd ? 'production' : 'development'})`)
})
