import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { lenisRef } from './utils/lenis'
import { EASE } from './components/shared'

export const PAGES = {
  home: 'Lia',
  menu: 'The Menu',
  story: 'Our Story',
  gallery: 'Gallery',
  reserve: 'Reservations',
  order: 'Order Online',
  login: 'Members',
} as const

export type PageId = keyof typeof PAGES

type Veil = { target: PageId; stage: 'cover' | 'reveal' } | null

const RouterCtx = createContext<{ page: PageId; navigate: (p: PageId) => void } | null>(null)

export function useRouter() {
  const ctx = useContext(RouterCtx)
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider')
  return ctx
}

function scrollTopImmediate() {
  if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
  window.scrollTo(0, 0)
}

/* Layered curtain wipe shown between pages */
function PageVeil({ veil }: { veil: Veil }) {
  if (!veil) return null
  const cover = veil.stage === 'cover'
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {/* ember underlay panel (lagging) */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: cover ? '0%' : '-100%' }}
        transition={{ duration: cover ? 0.78 : 0.95, ease: [0.76, 0, 0.24, 1], delay: cover ? 0.07 : 0.05 }}
        className="absolute inset-0 bg-ember"
      />
      {/* main dark panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: cover ? '0%' : '-100%' }}
        transition={{ duration: cover ? 0.78 : 0.95, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-coal"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-5 text-ember"
        >
          <Flame size={26} strokeWidth={1.5} fill="currentColor" fillOpacity={0.3} />
        </motion.div>
        <div className="overflow-hidden">
          <motion.span
            key={veil.target}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="block font-serif text-4xl font-medium italic text-cream md:text-6xl"
          >
            {PAGES[veil.target]}
          </motion.span>
        </div>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          className="mt-6 h-px w-24 origin-center bg-ember/70"
        />
      </motion.div>
    </div>
  )
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageId>('home')
  const [veil, setVeil] = useState<Veil>(null)
  const busy = useRef(false)

  const navigate = useCallback(
    (target: PageId) => {
      if (busy.current) return
      if (target === page) {
        if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.2 })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      busy.current = true
      setVeil({ target, stage: 'cover' })
      window.setTimeout(() => {
        setPage(target)
        scrollTopImmediate()
      }, 780)
      window.setTimeout(() => setVeil({ target, stage: 'reveal' }), 1330)
      window.setTimeout(() => {
        setVeil(null)
        busy.current = false
      }, 2340)
    },
    [page]
  )

  const value = useMemo(() => ({ page, navigate }), [page, navigate])

  return (
    <RouterCtx.Provider value={value}>
      {children}
      <PageVeil veil={veil} />
    </RouterCtx.Provider>
  )
}
