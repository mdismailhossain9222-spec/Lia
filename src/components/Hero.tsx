import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { EASE } from './shared'

const TITLE = 'LIA'

export default function Hero({ started }: { started: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 180])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const show = started ? 'visible' : 'hidden'

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center px-6">
        {/* eyebrow pill */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
          initial="hidden"
          animate={show}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="mb-8 flex items-center gap-3 rounded-full border border-cream/15 bg-ink/40 px-5 py-2 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
          <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-cream/80">
            Est. 2017 — One Michelin Star
          </span>
        </motion.div>

        {/* title */}
        <h1
          aria-label="Lia"
          className="flex select-none overflow-hidden font-serif text-[clamp(5.5rem,21vw,19rem)] font-medium leading-[0.86] tracking-[0.02em] text-cream"
        >
          {TITLE.split('').map((letter, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { y: '112%', rotate: 6 },
                visible: { y: 0, rotate: 0 },
              }}
              initial="hidden"
              animate={show}
              transition={{ duration: 1.2, ease: EASE, delay: 0.45 + i * 0.07 }}
              className="inline-block will-change-transform"
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* subline */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}
          initial="hidden"
          animate={show}
          transition={{ duration: 1, ease: EASE, delay: 1.15 }}
          className="mt-10 flex flex-col items-center gap-4 text-center"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent via-ember to-transparent" />
          <p className="max-w-md font-serif text-2xl italic leading-snug text-cream/85 md:text-3xl">
            A tasting menu written in smoke and season
          </p>
          <p className="text-[10px] uppercase tracking-[0.45em] text-smoke">
            Twelve courses — One open hearth
          </p>
        </motion.div>
      </motion.div>

      {/* corners */}
      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        initial="hidden"
        animate={show}
        transition={{ duration: 1, delay: 1.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-6 text-[10px] uppercase tracking-[0.3em] text-smoke md:p-10"
      >
        <span className="hidden sm:block">12 Foundry Row — West Loop</span>
        <div className="flex flex-col items-center gap-3">
          <span>Scroll</span>
          <div className="relative h-14 w-px overflow-hidden bg-cream/15">
            <motion.span
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 top-0 h-1/2 w-full bg-ember"
            />
          </div>
          <ArrowDown size={13} className="text-ember" />
        </div>
        <span className="hidden sm:block">Tue — Sun / 17:30 — 00:00</span>
      </motion.div>

      {/* side words */}
      <motion.span
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        initial="hidden"
        animate={show}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-[0.5em] text-smoke/70 lg:block"
      >
        Wood — Smoke — Season
      </motion.span>
      <motion.span
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        initial="hidden"
        animate={show}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 rotate-90 text-[10px] uppercase tracking-[0.5em] text-smoke/70 lg:block"
      >
        Oak — Ash — Flame
      </motion.span>
    </section>
  )
}
