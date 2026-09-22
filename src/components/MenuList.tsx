import { useRef, useState } from 'react'
import type { MouseEvent as FMMouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { FadeUp } from './shared'

export type MenuItem = {
  name: string
  note: string
  price: string
  img: string
}

export const MENU_GROUPS: { id: string; label: string; items: MenuItem[] }[] = [
  {
    id: 'begin',
    label: 'To Begin',
    items: [
      { name: 'Sourdough & Smoked Butter', note: 'hearth loaf, embered crust', price: '9', img: '/images/embers.jpg' },
      { name: 'Embered Leek & Marrow', note: 'rye crumb, chive blossom', price: '16', img: '/images/dish-1.jpg' },
      { name: 'Cured Trout, Juniper Ash', note: 'ash oil, rye crisp', price: '18', img: '/images/dish-3.jpg' },
    ],
  },
  {
    id: 'fire',
    label: 'From the Fire',
    items: [
      { name: 'Dry-Aged Duck, Burnt Cherry', note: 'endive, jus gras', price: '42', img: '/images/dish-2.jpg' },
      { name: 'Wagyu A5, Charred Allium', note: 'aged shoyu, wasabi leaf', price: '68', img: '/images/dish-3.jpg' },
      { name: 'Whole Turbot, Seaweed Butter', note: 'grilled lemon, sea herbs', price: '54', img: '/images/dish-1.jpg' },
      { name: 'Celeriac Baked in Embers', note: 'black garlic, hazelnut', price: '34', img: '/images/embers.jpg' },
    ],
  },
  {
    id: 'end',
    label: 'To End',
    items: [
      { name: 'Cacao, Ash Meringue, Smoked Salt', note: 'cold cream, cacao nib', price: '16', img: '/images/dish-4.jpg' },
      { name: 'Burnt Honey & Sheep Yoghurt', note: 'pollen, oat crumb', price: '14', img: '/images/dish-4.jpg' },
    ],
  },
  {
    id: 'drinks',
    label: 'Smoke & Oak — Drinks',
    items: [
      { name: 'Smoked Old Fashioned', note: 'rye, burnt orange, oak smoke', price: '19', img: '/images/bar.jpg' },
      { name: 'Ember Spritz', note: 'amaro, charred grapefruit', price: '17', img: '/images/bar.jpg' },
      { name: 'Natural Wines — glass', note: 'a living list, ask tonight', price: '16', img: '/images/interior.jpg' },
      { name: 'Zero-Proof Pairing', note: ' smoked teas, shrubs, verjus', price: '65', img: '/images/plating.jpg' },
    ],
  },
]

export default function MenuList() {
  const listRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<MenuItem | null>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 })
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 })

  const onMove = (e: FMMouseEvent<HTMLDivElement>) => {
    const rect = listRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  return (
    <div
      ref={listRef}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
      className="relative"
    >
      {/* floating image preview (desktop) */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none absolute left-0 top-0 z-30 hidden lg:block"
      >
        <div className="-translate-x-1/2 -translate-y-[112%]">
          <AnimatePresence mode="popLayout">
            {active && (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.72, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.72, rotate: 5 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="h-[280px] w-[220px] overflow-hidden shadow-2xl shadow-black/70"
              >
                <img loading="lazy" decoding="async" src={active.img} alt="" className="h-full w-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {MENU_GROUPS.map((group, gi) => (
        <FadeUp key={group.id} delay={gi * 0.05} className="mt-16 first:mt-0">
          <div id={`menu-${group.id}`} className="scroll-mt-32">
            <div className="flex items-center gap-4">
              <span className="font-serif text-lg italic text-ember">0{gi + 1}</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ember">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-ember/40 to-transparent" />
            </div>

            <div className="mt-2">
              {group.items.map((item) => (
                <button
                  key={item.name}
                  onMouseEnter={() => setActive(item)}
                  onFocus={() => setActive(item)}
                  className="group flex w-full items-baseline gap-4 border-b border-cream/10 py-6 text-left transition-colors md:py-7"
                >
                  <span className="font-serif text-2xl font-medium leading-tight text-cream/85 transition-all duration-500 group-hover:translate-x-3 group-hover:text-flame md:text-4xl">
                    {item.name}
                  </span>
                  <span className="hidden shrink-0 text-xs italic text-smoke md:block">
                    {item.note}
                  </span>
                  <span className="mx-2 hidden flex-1 border-b border-dotted border-cream/20 sm:block" />
                  <span className="ml-auto shrink-0 font-serif text-xl italic text-cream/70 transition-colors duration-300 group-hover:text-flame md:text-2xl">
                    {item.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </FadeUp>
      ))}
    </div>
  )
}
