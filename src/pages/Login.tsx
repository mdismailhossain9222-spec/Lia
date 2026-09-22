import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  ConciergeBell,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'
import { AuthError, DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '../auth'
import { EASE, Eyebrow, FadeUp } from '../components/shared'
import { useRouter } from '../router'
import { cn } from '../utils/cn'

const inputCls =
  'w-full border-b border-cream/20 bg-transparent py-3 pl-9 text-base text-cream placeholder:text-smoke/60 outline-none transition-colors duration-300 focus:border-ember'
const labelCls = 'mb-1 block text-[10px] uppercase tracking-[0.35em] text-smoke'

const PERKS = [
  { icon: CalendarCheck, text: 'Priority seating windows, released to members first' },
  { icon: Sparkles, text: 'Invitations to fire-side evenings and cellar pours' },
  { icon: ConciergeBell, text: 'One-tap rebooking with your preferences remembered' },
]

function strengthOf(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function Login() {
  const { login, register, backend } = useAuth()
  const { navigate } = useRouter()

  const [mode, setMode] = useState<'signin' | 'join'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ msg: string; retryAfter?: number } | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [welcome, setWelcome] = useState<string | null>(null)

  /* lockout countdown ticker */
  useEffect(() => {
    if (!error?.retryAfter) return
    setCountdown(error.retryAfter)
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id)
          setError(null)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [error])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user =
        mode === 'signin' ? await login(email, password) : await register(name, email, password)
      void remember // sessions persist 12h; flag kept for backend parity
      setWelcome(user.name)
      window.setTimeout(() => navigate('home'), 1400)
    } catch (err) {
      if (err instanceof AuthError) {
        setError({ msg: err.message, retryAfter: err.retryAfter })
      } else {
        setError({ msg: 'Something went wrong. Please try again.' })
      }
    } finally {
      setBusy(false)
    }
  }

  const strength = strengthOf(password)
  const strengthLabel = ['Too weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength]

  return (
    <section className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:px-10 lg:grid-cols-2 lg:gap-20 lg:pt-36">
      {/* left — mood panel */}
      <FadeUp className="relative hidden overflow-hidden lg:block" y={40}>
        <img
          src="/images/embers.jpg"
          alt="Glowing embers in the hearth"
          className="aspect-[4/5] w-full object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/40" />
        <span className="absolute left-8 top-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-cream/80">
          <ShieldCheck size={15} className="text-ember" />
          Members only
        </span>
        <span className="absolute bottom-10 left-8 right-8">
          <span className="block font-serif text-4xl font-medium italic leading-snug text-cream xl:text-5xl">
            &ldquo;The fire remembers its friends.&rdquo;
          </span>
          <span className="mt-6 flex flex-col gap-4">
            {PERKS.map((p) => (
              <span key={p.text} className="flex items-center gap-3 text-xs text-cream/75">
                <p.icon size={14} className="shrink-0 text-flame" />
                {p.text}
              </span>
            ))}
          </span>
        </span>
      </FadeUp>

      {/* right — form */}
      <div>
        <Eyebrow index="06" label="Members" />
        <FadeUp delay={0.1}>
          <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.03] text-cream md:text-7xl">
            {welcome ? (
              <>
                Welcome back,
                <br />
                <span className="italic text-flame">{welcome.split(' ')[0]}</span>
              </>
            ) : (
              <>
                Sign in to
                <br />
                the <span className="italic text-flame">inner hearth</span>
              </>
            )}
          </h1>
        </FadeUp>

        <FadeUp delay={0.15} className="mt-10">
          <div className="relative border border-cream/10 bg-coal/70 p-7 backdrop-blur-md md:p-10">
            <span className="absolute -top-px left-10 h-px w-20 bg-ember" />

            <AnimatePresence mode="wait">
              {welcome ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex min-h-[280px] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-ember text-ember"
                  >
                    <Check size={26} />
                  </motion.span>
                  <p className="mt-7 font-serif text-2xl italic text-cream">
                    Your seat by the fire awaits
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-smoke">
                    Taking you home…
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
                  {/* mode tabs */}
                  <div className="mb-9 grid grid-cols-2 border-b border-cream/10">
                    {(['signin', 'join'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m)
                          setError(null)
                        }}
                        className={cn(
                          'relative pb-4 text-[11px] font-medium uppercase tracking-[0.3em] transition-colors',
                          mode === m ? 'text-cream' : 'text-smoke hover:text-cream/70'
                        )}
                      >
                        {m === 'signin' ? 'Sign in' : 'Join'}
                        {mode === m && (
                          <motion.span
                            layoutId="login-tab"
                            className="absolute -bottom-px left-0 h-px w-full bg-ember"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={submit} noValidate className="space-y-8">
                    <AnimatePresence initial={false}>
                      {mode === 'join' && (
                        <motion.div
                          key="name"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="pb-8">
                            <label htmlFor="li-name" className={labelCls}>Name</label>
                            <div className="relative">
                              <UserIcon size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-smoke" />
                              <input
                                id="li-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                autoComplete="name"
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label htmlFor="li-email" className={labelCls}>Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-smoke" />
                        <input
                          id="li-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          autoComplete="email"
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="li-password" className={labelCls}>Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-smoke" />
                        <input
                          id="li-password"
                          type={showPw ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                          required
                          minLength={8}
                          className={cn(inputCls, 'pr-10')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-smoke transition-colors hover:text-flame"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {mode === 'join' && password.length > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex flex-1 gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <span
                                key={bar}
                                className={cn(
                                  'h-0.5 flex-1 transition-colors duration-500',
                                  strength >= bar ? 'bg-ember' : 'bg-cream/10'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-smoke">
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="group flex items-center gap-3 text-xs text-smoke" data-hover>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={remember}
                          onClick={() => setRemember((r) => !r)}
                          className={cn(
                            'flex h-4.5 w-4.5 items-center justify-center border transition-colors h-[18px] w-[18px]',
                            remember ? 'border-ember bg-ember text-ink' : 'border-cream/25'
                          )}
                        >
                          {remember && <Check size={11} strokeWidth={3} />}
                        </button>
                        Keep me signed in
                      </label>
                      <span className="text-xs italic text-smoke/70">Forgot password? Ask the maître d&apos;.</span>
                    </div>

                    {/* error / lockout banner */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <div
                            role="alert"
                            className="flex items-start gap-3 border border-ember/50 bg-ember/10 px-4 py-3.5 text-sm text-flame"
                          >
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>
                              {error.msg}
                              {countdown > 0 && (
                                <span className="ml-1 font-medium tabular-nums">
                                  Retry in {countdown}s.
                                </span>
                              )}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={busy || countdown > 0}
                      className="group relative w-full overflow-hidden border border-ember py-5 text-[11px] font-medium uppercase tracking-[0.4em] text-cream transition-opacity disabled:opacity-60"
                    >
                      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
                      <span className="relative flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
                        {busy && <Loader2 size={15} className="animate-spin" />}
                        {busy
                          ? 'Checking…'
                          : countdown > 0
                            ? `Locked · ${countdown}s`
                            : mode === 'signin'
                              ? 'Sign in'
                              : 'Create membership'}
                      </span>
                    </button>

                    <p className="flex items-start gap-2.5 text-xs leading-relaxed text-smoke">
                      <Info size={13} className="mt-0.5 shrink-0 text-ember/70" />
                      {backend ? (
                        <>Secured by httpOnly sessions, rotating tokens and rate limiting.</>
                      ) : (
                        <>
                          Demo environment — sign in with{' '}
                          <span className="text-cream/80">{DEMO_EMAIL}</span> /{' '}
                          <span className="text-cream/80">{DEMO_PASSWORD}</span>, or create your own
                          account above. Passwords are stored hashed, never in plain text.
                        </>
                      )}
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
