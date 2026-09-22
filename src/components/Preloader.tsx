import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { EASE } from './shared'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let value = 0
    const id = window.setInterval(() => {
      value += Math.floor(Math.random() * 5) + 2
      if (value >= 100) {
        value = 100
        window.clearInterval(id)
        window.setTimeout(onDone, 500)
      }
      setCount(value)
    }, 36)
    return () => window.clearInterval(id)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      exit={{ y: '-100%' }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-ember"
      >
        <Flame size={34} strokeWidth={1.5} fill="currentColor" fillOpacity={0.25} />
      </motion.div>

      <div className="mt-6 flex overflow-hidden font-serif text-6xl font-medium tracking-[0.08em] md:text-7xl">
        {'LIA'.split('').map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.07 }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-4 text-[10px] uppercase tracking-[0.5em] text-smoke"
      >
        Fire-Driven Cuisine
      </motion.p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-10">
        <span className="text-[10px] uppercase tracking-[0.35em] text-smoke">
          Chicago — Est. 2017
        </span>
        <span className="font-serif text-7xl italic leading-none text-cream/90 tabular-nums md:text-8xl">
          {count}
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 h-px bg-ember transition-[width] duration-150 ease-out"
        style={{ width: `${count}%` }}
      />
    </motion.div>
  )
}
