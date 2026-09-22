import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, LogOut, Menu, ShoppingBag, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { EASE } from './shared'
import { useRouter } from '../router'
import type { PageId } from '../router'
import { useAuth } from '../auth'
import { useCart } from '../cart'

const LINKS: { label: string; page: PageId }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Menu', page: 'menu' },
  { label: 'Story', page: 'story' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'Order', page: 'order' },
]

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Navbar() {
  const { page, navigate } = useRouter()
  const { user, logout } = useAuth()
  const { count, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (target: PageId) => {
    if (open) {
      setOpen(false)
      window.setTimeout(() => navigate(target), 350)
    } else {
      navigate(target)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 2.9 }}
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-500',
          scrolled && !open
            ? 'border-b border-cream/10 bg-ink/75 backdrop-blur-md'
            : 'border-b border-transparent'
        )}
      >
        <nav className="flex items-center justify-between px-6 py-4 md:px-10">
          <button onClick={() => go('home')} className="group flex items-center gap-2.5" aria-label="Lia — home">
            <Flame
              size={20}
              className="text-ember transition-transform duration-500 group-hover:scale-110"
              fill="currentColor"
              fillOpacity={0.3}
            />
            <span className="font-serif text-xl font-semibold tracking-[0.18em]">LIA</span>
          </button>

          <div className="hidden items-center gap-9 lg:flex">
            {LINKS.map((link) => (
              <button
                key={link.page}
                onClick={() => go(link.page)}
                className={cn(
                  'group relative text-[11px] font-medium uppercase tracking-[0.3em] transition-colors hover:text-cream',
                  page === link.page ? 'text-cream' : 'text-cream/55'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1.5 left-0 h-px w-full bg-ember transition-transform duration-500 ease-out',
                    page === link.page
                      ? 'origin-left scale-x-100'
                      : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* cart */}
            <button
              onClick={() => openCart('cart')}
              aria-label={`View your order — ${count} items`}
              className="relative flex h-10 w-10 items-center justify-center border border-cream/20 text-cream transition-colors hover:border-ember"
            >
              <ShoppingBag size={16} strokeWidth={1.6} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ember text-[10px] font-semibold text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* auth: account chip or sign-in */}
            {user ? (
              <div className="group relative hidden sm:block" data-hover>
                <button className="flex items-center gap-2.5 border border-cream/15 py-1.5 pl-1.5 pr-4 transition-colors group-hover:border-ember/50">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ember font-sans text-[10px] font-semibold tracking-wide text-ink">
                    {initialsOf(user.name)}
                  </span>
                  <span className="max-w-20 truncate text-[11px] font-medium uppercase tracking-[0.2em] text-cream">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <div className="pointer-events-none absolute right-0 top-full translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="w-60 border border-cream/10 bg-coal/95 p-5 backdrop-blur-md">
                    <p className="font-serif text-lg italic text-cream">{user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-smoke">{user.email}</p>
                    <div className="mt-4 flex flex-col gap-2 border-t border-cream/10 pt-4">
                      <button
                        onClick={() => go('reserve')}
                        className="border border-ember/60 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-flame transition-colors hover:bg-ember hover:text-ink"
                      >
                        Book a table
                      </button>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-1 py-1.5 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-smoke transition-colors hover:text-cream"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => go('login')}
                className={cn(
                  'hidden border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.3em] transition-colors sm:block',
                  page === 'login'
                    ? 'border-cream/40 text-cream'
                    : 'border-cream/20 text-cream/75 hover:border-ember hover:text-flame'
                )}
              >
                Sign in
              </button>
            )}

            <button
              onClick={() => go('reserve')}
              className={cn(
                'group relative hidden overflow-hidden border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.3em] sm:block',
                page === 'reserve' ? 'border-ember bg-ember text-ink' : 'border-ember/70 text-cream'
              )}
            >
              {page !== 'reserve' && (
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
              )}
              <span className="relative transition-colors duration-300 group-hover:text-ink">Reserve</span>
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center border border-cream/20 text-cream transition-colors hover:border-ember lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-coal"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="flex items-center gap-2.5">
                <Flame size={20} className="text-ember" fill="currentColor" fillOpacity={0.3} />
                <span className="font-serif text-xl font-semibold tracking-[0.18em]">LIA</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-cream/20"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2 px-8">
              {[...LINKS, { label: 'Reserve', page: 'reserve' as PageId }].map((link, i) => (
                <div key={link.page} className="overflow-hidden">
                  <motion.button
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.06 }}
                    onClick={() => go(link.page)}
                    className={cn(
                      'flex items-baseline gap-4 py-2 text-left font-serif text-5xl font-medium transition-colors hover:text-flame',
                      page === link.page ? 'text-flame' : 'text-cream'
                    )}
                  >
                    <span className="text-sm italic text-ember">0{i + 1}</span>
                    {link.label}
                    {page === link.page && <span className="h-2 w-2 rounded-full bg-ember" aria-hidden />}
                  </motion.button>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-between gap-4 border-t border-cream/10 px-8 py-6 text-[10px] uppercase tracking-[0.3em] text-smoke"
            >
              <span>12 Foundry Row, Chicago</span>
              {user ? (
                <button
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 text-cream/70 transition-colors hover:text-flame"
                >
                  <LogOut size={12} />
                  Sign out · {user.name.split(' ')[0]}
                </button>
              ) : (
                <button onClick={() => go('login')} className="text-flame transition-colors hover:text-cream">
                  Members sign in
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
