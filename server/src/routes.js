/* ------------------------------------------------------------------ */
/*  LIA API — routes                                                    */
/*  /api/auth          register · login · refresh · logout · me         */
/*  /api/reservations  create · mine · cancel                           */
/* ------------------------------------------------------------------ */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import {
  authOptional,
  authRequired,
  clearAuthCookies,
  config,
  loginSchema,
  MENU_PRICES,
  newJti,
  orderSchema,
  PACKAGING_FEE,
  publicUser,
  registerSchema,
  reservationSchema,
  setAuthCookies,
  signAccess,
  signRefresh,
  store,
  validate,
  verifyRefresh,
} from './lib.js'

/* Timing-uniform comparison target when an account doesn't exist */
const DUMMY_HASH = bcrypt.hashSync('placeholder-password', 12)

const issueSession = (res, user) => {
  const jti = newJti()
  const access = signAccess(user)
  const refresh = signRefresh(user.id, jti)
  store.refresh.put({
    jti,
    userId: user.id,
    exp: Date.now() + config.refreshTtlSec * 1000,
    revoked: false,
  })
  setAuthCookies(res, { access, refresh })
}

/* ============================ /api/auth ========================== */

export const authRouter = Router()

/* POST /api/auth/register */
authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.data
  if (store.users.byEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }
  const hash = await bcrypt.hash(password, 12)
  const user = store.users.insert({
    id: newJti(),
    name,
    email,
    hash,
    failedCount: 0,
    lockUntil: 0,
    createdAt: Date.now(),
  })
  issueSession(res, user)
  res.status(201).json({ user: publicUser(user) })
})

/* POST /api/auth/login — generic errors, lockout after N failures */
authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.data
  const user = store.users.byEmail(email)

  if (user?.lockUntil && user.lockUntil > Date.now()) {
    res.set('Retry-After', String(Math.ceil((user.lockUntil - Date.now()) / 1000)))
    return res
      .status(429)
      .json({ error: 'Too many failed attempts. Please wait before trying again.' })
  }

  const ok = await bcrypt.compare(password, user?.hash ?? DUMMY_HASH)
  if (!user || !ok) {
    if (user) {
      const failedCount = (user.failedCount ?? 0) + 1
      store.users.update(email, {
        failedCount: failedCount >= config.lockAfter ? 0 : failedCount,
        lockUntil: failedCount >= config.lockAfter ? Date.now() + config.lockMinutes * 60_000 : 0,
      })
    }
    // generic message on purpose — never reveal whether the account exists
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  store.users.update(email, { failedCount: 0, lockUntil: 0 })
  issueSession(res, user)
  res.json({ user: publicUser(user) })
})

/* POST /api/auth/refresh — rotating refresh tokens (reuse = revoked) */
authRouter.post('/refresh', (req, res) => {
  const token = req.cookies?.lia_refresh
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  let payload
  try {
    payload = verifyRefresh(token)
  } catch {
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Session expired — please sign in again' })
  }

  const record = store.refresh.get(payload.jti)
  if (!record || record.revoked || record.exp < Date.now()) {
    if (record) store.refresh.revoke(payload.jti)
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Session expired — please sign in again' })
  }

  const account = store.users.byId(payload.sub)
  if (!account) {
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Account not found' })
  }

  store.refresh.revoke(payload.jti) // rotate: the old refresh token dies here
  issueSession(res, account)
  res.json({ user: publicUser(account) })
})

/* POST /api/auth/logout */
authRouter.post('/logout', (req, res) => {
  const token = req.cookies?.lia_refresh
  if (token) {
    try {
      store.refresh.revoke(verifyRefresh(token).jti)
    } catch {
      /* already invalid — nothing to revoke */
    }
  }
  clearAuthCookies(res)
  res.json({ ok: true })
})

/* GET /api/auth/me */
authRouter.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

/* ======================== /api/reservations ====================== */

const publicReservation = (r) => ({
  id: r.id,
  date: r.date,
  time: r.time,
  guests: r.guests,
  area: r.area,
  name: r.name,
  occasion: r.occasion,
  status: r.status,
  createdAt: r.createdAt,
})

export const reservationRouter = Router()

/* POST /api/reservations — works for members and guests */
reservationRouter.post('/', authOptional, validate(reservationSchema), (req, res) => {
  const { company, ...fields } = req.data

  // honeypot: bots see success, nothing is stored
  if (company && company.length > 0) return res.status(200).json({ ok: true })

  if (req.user) {
    const clash = store.reservations
      .forUser(req.user.id)
      .some((r) => r.date === fields.date && r.status === 'held')
    if (clash) {
      return res.status(409).json({ error: 'You already hold a table that evening' })
    }
  }

  const reservation = store.reservations.insert({
    id: newJti(),
    userId: req.user?.id ?? null,
    ...fields,
    status: 'held',
    createdAt: Date.now(),
  })
  res.status(201).json({ reservation: publicReservation(reservation) })
})

/* GET /api/reservations/mine — member's own tables */
reservationRouter.get('/mine', authRequired, (req, res) => {
  const mine = store.reservations
    .forUser(req.user.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(publicReservation)
  res.json({ reservations: mine })
})

/* DELETE /api/reservations/:id — cancel own reservation */
reservationRouter.delete('/:id', authRequired, (req, res) => {
  const r = store.reservations.byId(req.params.id)
  if (!r || r.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
  store.reservations.update(r.id, { status: 'cancelled' })
  res.json({ ok: true })
})

/* =========================== /api/orders ========================= */

export const orderRouter = Router()

/* POST /api/orders — prices recomputed server-side, always */
orderRouter.post('/', authOptional, validate(orderSchema), (req, res) => {
  const { company, items, name, phone, pickupTime } = req.data

  // honeypot: bots see success, nothing is stored
  if (company && company.length > 0) return res.status(200).json({ ok: true })

  const priced = items.map((i) => ({
    ...i,
    unitPrice: MENU_PRICES[i.id],
    lineTotal: MENU_PRICES[i.id] * i.qty,
  }))
  const subtotal = priced.reduce((sum, i) => sum + i.lineTotal, 0)
  const total = subtotal + PACKAGING_FEE

  const order = store.orders.insert({
    id: `LIA-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user?.id ?? null,
    items: priced,
    name,
    phone,
    pickupTime,
    subtotal,
    fee: PACKAGING_FEE,
    total,
    status: 'received', // received → fired → ready → collected
    createdAt: Date.now(),
  })

  res.status(201).json({
    order: {
      id: order.id,
      items: order.items,
      subtotal: order.subtotal,
      fee: order.fee,
      total: order.total,
      pickupTime: order.pickupTime,
      status: order.status,
    },
  })
})

/* GET /api/orders/mine — member's order history */
orderRouter.get('/mine', authRequired, (req, res) => {
  const mine = store.orders
    .forUser(req.user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((o) => ({
      id: o.id,
      items: o.items,
      total: o.total,
      pickupTime: o.pickupTime,
      status: o.status,
      createdAt: o.createdAt,
    }))
  res.json({ orders: mine })
})
