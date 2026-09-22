import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/*  LIA auth engine                                                     */
/*                                                                      */
/*  Two modes:                                                          */
/*  · LIVE  — when VITE_API_URL is set, all calls go to the Express     */
/*            API in /server (httpOnly JWT cookies, bcrypt, rotation).  */
/*  · DEMO  — a fully client-side engine: accounts are stored locally   */
/*            with SHA-256 hashed passwords, sessions expire after      */
/*            12h, and sign-in locks for 30s after 5 failed tries.      */
/* ------------------------------------------------------------------ */

const API_URL = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL

export const DEMO_EMAIL = 'guest@lia.rest'
export const DEMO_PASSWORD = 'fire-2026'

export type User = { name: string; email: string }
type StoredUser = User & { hash: string; createdAt: number }
type Session = { user: User; exp: number }
type Attempts = Record<string, { count: number; until: number }>

export class AuthError extends Error {
  code: 'format' | 'invalid' | 'locked' | 'taken' | 'network'
  retryAfter?: number
  constructor(code: AuthError['code'], message: string, retryAfter?: number) {
    super(message)
    this.code = code
    this.retryAfter = retryAfter
  }
}

const USERS_KEY = 'lia.users.v1'
const SESSION_KEY = 'lia.session.v1'
const ATTEMPTS_KEY = 'lia.attempts.v1'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}
function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}

/* SHA-256 hashing (Web Crypto). Falls back to a marked plain string on
   non-secure contexts so the demo never silently breaks. */
async function hashPassword(email: string, password: string) {
  const salted = `${password}::${email.toLowerCase()}::lia-demo-v1`
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return `plain:${salted}`
  }
}

async function ensureSeed() {
  const users = readJSON<StoredUser[]>(USERS_KEY, [])
  if (users.some((u) => u.email === DEMO_EMAIL)) return
  users.push({
    name: 'Guest',
    email: DEMO_EMAIL,
    hash: await hashPassword(DEMO_EMAIL, DEMO_PASSWORD),
    createdAt: Date.now(),
  })
  writeJSON(USERS_KEY, users)
}

function guardAttempts(email: string): Attempts {
  const attempts = readJSON<Attempts>(ATTEMPTS_KEY, {})
  const rec = attempts[email]
  if (rec && rec.until > Date.now()) {
    throw new AuthError(
      'locked',
      'Too many failed attempts. Please wait before trying again.',
      Math.ceil((rec.until - Date.now()) / 1000)
    )
  }
  return attempts
}
function failAttempt(attempts: Attempts, email: string): never {
  const rec = attempts[email] ?? { count: 0, until: 0 }
  rec.count += 1
  if (rec.count >= 5) {
    rec.count = 0
    rec.until = Date.now() + 30_000
  }
  attempts[email] = rec
  writeJSON(ATTEMPTS_KEY, attempts)
  throw new AuthError('invalid', 'Invalid email or password.')
}
function clearAttempts(email: string) {
  const attempts = readJSON<Attempts>(ATTEMPTS_KEY, {})
  if (attempts[email]) {
    delete attempts[email]
    writeJSON(ATTEMPTS_KEY, attempts)
  }
}

/* backend calls (LIVE mode) */
async function backend<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string } & T
  if (!res.ok) throw new AuthError('invalid', json.error ?? 'Request failed.')
  return json
}

/* validation */
export const validEmail = (e: string) => /\S+@\S+\.\S+/.test(e)
export const validPassword = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p)

type AuthValue = {
  user: User | null
  backend: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthCtx = createContext<AuthValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = readJSON<Session | null>(SESSION_KEY, null)
    return s && s.exp > Date.now() ? s.user : null
  })

  const persist = (u: User | null) => {
    if (u) writeJSON(SESSION_KEY, { user: u, exp: Date.now() + 12 * 60 * 60 * 1000 } satisfies Session)
    else removeKey(SESSION_KEY)
    setUser(u)
  }

  const login: AuthValue['login'] = async (emailRaw, password) => {
    const email = emailRaw.trim().toLowerCase()
    if (!validEmail(email)) throw new AuthError('format', 'Enter a valid email address.')
    if (password.length < 8) throw new AuthError('format', 'Password must be at least 8 characters.')

    const attempts = guardAttempts(email)

    if (API_URL) {
      try {
        const { user } = await backend<{ user: User }>('/api/auth/login', { email, password })
        clearAttempts(email)
        persist(user)
        return user
      } catch (err) {
        if (err instanceof AuthError && err.code === 'invalid') failAttempt(attempts, email)
        throw new AuthError('network', 'Could not reach the member service. Try again shortly.')
      }
    }

    /* DEMO mode */
    await ensureSeed()
    await wait(850)
    const found = readJSON<StoredUser[]>(USERS_KEY, []).find((u) => u.email === email)
    const hash = await hashPassword(email, password)
    if (!found || found.hash !== hash) failAttempt(attempts, email)
    clearAttempts(email)
    const u: User = { name: found.name, email: found.email }
    persist(u)
    return u
  }

  const register: AuthValue['register'] = async (nameRaw, emailRaw, password) => {
    const name = nameRaw.trim()
    const email = emailRaw.trim().toLowerCase()
    if (name.length < 2) throw new AuthError('format', 'Tell us your name.')
    if (!validEmail(email)) throw new AuthError('format', 'Enter a valid email address.')
    if (!validPassword(password))
      throw new AuthError('format', 'Password needs 8+ characters with a letter and a number.')

    if (API_URL) {
      const { user } = await backend<{ user: User }>('/api/auth/register', { name, email, password })
      persist(user)
      return user
    }

    await ensureSeed()
    await wait(900)
    const users = readJSON<StoredUser[]>(USERS_KEY, [])
    if (users.some((u) => u.email === email))
      throw new AuthError('taken', 'An account already exists for this email.')
    const u: User = { name, email }
    users.push({ ...u, hash: await hashPassword(email, password), createdAt: Date.now() })
    writeJSON(USERS_KEY, users)
    persist(u)
    return u
  }

  const logout = () => {
    if (API_URL) void backend('/api/auth/logout', {}).catch(() => undefined)
    persist(null)
  }

  const value = useMemo<AuthValue>(
    () => ({ user, backend: Boolean(API_URL), login, register, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
