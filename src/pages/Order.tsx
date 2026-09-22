import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, Flame, MapPin, Minus, MoveRight, Plus, ShoppingBag } from 'lucide-react'
import { CATEGORIES, ORDER_ITEMS, PACKAGING_FEE, fmt, useCart } from '../cart'
import type { OrderItem } from '../cart'
import { EASE, Eyebrow, FadeUp, PageHero } from '../components/shared'
import { cn } from '../utils/cn'

const INFO = [
  { icon: Clock, text: 'Ready in ~25 minutes' },
  { icon: MapPin, text: 'Collect at the bar — 12 Foundry Row' },
  { icon: Flame, text: 'Cooked over embers, to order' },
]

function ItemCard({ item, index }: { item: OrderItem; index: number }) {
  const { items, add, setQty } = useCart()
  const inCart = items.find((i) => i.id === item.id)
  const qty = inCart?.qty ?? 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.05 }}
      className="group border border-cream/10 bg-coal/50 transition-colors duration-500 hover:border-ember/40"
    >
      <div className="relative overflow-hidden">
        <img
          loading="lazy"
          decoding="async"
          src={item.img}
          alt={item.name}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-coal/80 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-4 font-serif text-2xl italic text-flame">{fmt(item.price)}</span>
        {qty > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ember text-[11px] font-semibold text-ink"
          >
            {qty}
          </motion.span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl font-medium leading-tight text-cream">{item.name}</h3>
        <p className="mt-1.5 text-xs italic leading-relaxed text-smoke">{item.note}</p>
        <div className="mt-5">
          {qty === 0 ? (
            <button
              onClick={() => add(item)}
              className="group/btn relative w-full overflow-hidden border border-ember/60 py-3 text-[10px] font-medium uppercase tracking-[0.3em] text-cream"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-400 ease-out group-hover/btn:scale-y-100" />
              <span className="relative flex items-center justify-center gap-2 transition-colors duration-300 group-hover/btn:text-ink">
                <Plus size={13} /> Add to order
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between border border-ember/60">
              <button onClick={() => setQty(item.id, qty - 1)} aria-label="Remove one" className="grid h-11 w-11 place-items-center text-smoke transition-colors hover:text-flame">
                <Minus size={14} />
              </button>
              <span className="font-serif text-lg tabular-nums text-cream">{qty}</span>
              <button onClick={() => setQty(item.id, qty + 1)} aria-label="Add one more" className="grid h-11 w-11 place-items-center text-smoke transition-colors hover:text-flame">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function Order() {
  const { items, count, subtotal, total, openCart, isOpen, lastAdded } = useCart()
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const [toast, setToast] = useState<string | null>(null)

  /* "added to order" toast */
  useEffect(() => {
    if (!lastAdded) return
    setToast(lastAdded.name)
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [lastAdded])

  const filtered = cat === 'all' ? ORDER_ITEMS : ORDER_ITEMS.filter((i) => i.category === cat)

  return (
    <>
      <PageHero
        index="07"
        label="Pickup · West Loop"
        title="Order the"
        accent="Fire Home"
        sub="Same hearth, boxed with care — ready to collect in about twenty-five minutes."
      />

      {/* info strip */}
      <div className="relative z-10 border-y border-cream/10 bg-coal/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4">
          {INFO.map((row) => (
            <span key={row.text} className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] text-cream/70">
              <row.icon size={13} className="text-ember" />
              {row.text}
            </span>
          ))}
        </div>
      </div>

      <section className="relative z-10 px-6 pb-40 pt-14 md:px-10 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">
          {/* items */}
          <div className="lg:col-span-3">
            {/* category filter */}
            <FadeUp className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    'border px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.25em] transition-all duration-300',
                    cat === c.id
                      ? 'border-ember bg-ember text-ink'
                      : 'border-cream/15 text-cream/65 hover:border-ember/60 hover:text-flame'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </FadeUp>

            <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <ItemCard key={`${cat}-${item.id}`} item={item} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* sticky summary (desktop) */}
          <div className="hidden lg:col-span-2 lg:block">
            <FadeUp delay={0.15} className="sticky top-28">
              <div className="relative border border-cream/10 bg-coal/70 p-7 backdrop-blur-md">
                <span className="absolute -top-px left-8 h-px w-16 bg-ember" />
                <Eyebrow index="∑" label="Your Order" />
                {items.length === 0 ? (
                  <p className="mt-8 text-sm leading-relaxed text-smoke">
                    Nothing yet — the hearth is patient, but hungry. Add a few plates from
                    the menu.
                  </p>
                ) : (
                  <ul className="mt-7 space-y-3">
                    {items.map((i) => (
                      <li key={i.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-cream/85">
                          <span className="mr-2 font-serif italic text-flame">{i.qty}×</span>
                          {i.name}
                        </span>
                        <span className="tabular-nums text-smoke">{fmt(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-7 space-y-2 border-t border-cream/10 pt-5 text-sm text-smoke">
                  <p className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></p>
                  <p className="flex justify-between"><span>Ember packaging</span><span className="tabular-nums">{fmt(PACKAGING_FEE)}</span></p>
                  <p className="flex justify-between border-t border-cream/10 pt-3 font-serif text-xl text-cream">
                    <span>Total</span><span className="italic tabular-nums">{fmt(total)}</span>
                  </p>
                </div>
                <button
                  onClick={() => openCart(items.length > 0 ? 'pay' : 'cart')}
                  className="group relative mt-7 w-full overflow-hidden border border-ember py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-cream"
                >
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
                  <span className="relative flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
                    {items.length > 0 ? (
                      <>Review & pay <MoveRight size={14} /></>
                    ) : (
                      <>View order</>
                    )}
                  </span>
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* mobile floating bar */}
      <AnimatePresence>
        {count > 0 && !isOpen && (
          <motion.button
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={() => openCart('cart')}
            className="fixed inset-x-4 bottom-5 z-30 flex items-center justify-between border border-ember bg-coal/95 px-5 py-4 backdrop-blur-md lg:hidden"
          >
            <span className="flex items-center gap-3 text-cream">
              <span className="relative">
                <ShoppingBag size={18} />
                <span className="absolute -right-2 -top-2 grid h-4.5 h-[18px] w-[18px] place-items-center rounded-full bg-ember text-[9px] font-semibold text-ink">
                  {count}
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em]">View order</span>
            </span>
            <span className="font-serif text-lg italic text-flame">{fmt(total)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* added toast */}
      <AnimatePresence>
        {toast && !isOpen && (
          <motion.div
            key={toast}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-30 -translate-x-1/2 lg:bottom-10"
          >
            <div className="flex items-center gap-2.5 border border-ember/50 bg-ink/90 px-5 py-3 backdrop-blur-md">
              <Check size={14} className="text-ember" />
              <span className="whitespace-nowrap text-xs text-cream/90">
                Added — <span className="font-serif italic text-flame">{toast}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
