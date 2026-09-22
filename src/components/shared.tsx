import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* Eyebrow label — number, line and title */
export function Eyebrow({
  index,
  label,
  className,
}: {
  index: string
  label: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8, ease: EASE }}
      className={cn('flex items-center gap-4', className)}
    >
      <span className="font-serif italic text-flame">{index}</span>
      <span className="h-px w-12 bg-ember/60" />
      <span className="text-xs font-medium uppercase tracking-[0.35em] text-smoke">
        {label}
      </span>
    </motion.div>
  )
}

/* Word-by-word masked reveal for large statements */
export function WordReveal({
  text,
  className,
  accent = [],
  accentClass = 'italic text-flame',
  delay = 0,
}: {
  text: string
  className?: string
  accent?: string[]
  accentClass?: string
  delay?: number
}) {
  const words = text.split(' ')
  return (
    <motion.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-18%' }}
      className={className}
      aria-label={text}
    >
      {words.map((word, i) => {
        const clean = word.replace(/[^a-zA-Z-]/g, '').toLowerCase()
        const isAccent = accent.includes(clean)
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={cn('inline-block will-change-transform', isAccent && accentClass)}
              variants={{
                hidden: { y: '115%' },
                visible: {
                  y: 0,
                  transition: { duration: 0.85, ease: EASE, delay: delay + i * 0.032 },
                },
              }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        )
      })}
    </motion.p>
  )
}

/* Simple fade-up wrapper */
export function FadeUp({
  children,
  delay = 0,
  className,
  y = 32,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* Ember fill CTA button */
export function CTAButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden border border-ember/70 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-cream',
        className
      )}
    >
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
      <span className="relative transition-colors duration-300 group-hover:text-ink">{label}</span>
    </button>
  )
}

/* Shared page header for inner pages */
export function PageHero({
  index,
  label,
  title,
  accent,
  sub,
}: {
  index: string
  label: string
  title: string
  accent?: string
  sub?: string
}) {
  return (
    <header className="relative z-10 flex min-h-[62svh] flex-col items-center justify-center px-6 pb-16 pt-32 text-center md:pt-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        className="flex items-center gap-4"
      >
        <span className="font-serif italic text-flame">{index}</span>
        <span className="h-px w-12 bg-ember/60" />
        <span className="text-[10px] font-medium uppercase tracking-[0.45em] text-smoke">
          {label}
        </span>
      </motion.div>

      <h1 className="mt-8 overflow-hidden font-serif text-[clamp(3.6rem,11vw,9.5rem)] font-medium leading-[0.98] text-cream">
        <motion.span
          initial={{ y: '108%' }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
          className="block will-change-transform"
        >
          {title}
          {accent && <span className="italic text-flame"> {accent}</span>}
        </motion.span>
      </h1>

      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
          className="mt-8 max-w-md font-serif text-xl italic leading-snug text-cream/75 md:text-2xl"
        >
          {sub}
        </motion.p>
      )}

      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}
        className="mt-12 h-16 w-px origin-top bg-gradient-to-b from-ember to-transparent"
      />
    </header>
  )
}
