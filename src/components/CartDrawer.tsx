import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react'
import { PACKAGING_FEE, fmt, useCart } from '../cart'
import { useAuth } from '../auth'
import { EASE } from './shared'
import { cn } from '../utils/cn'

const API_URL = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL
const ORDERS_KEY = 'lia.orders.v1'

const PICKUP_TIMES = ['As soon as possible (~25 min)', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00']

const fieldCls =
  'w-full border-b border-cream/20 bg-transparent py-3 text-sm text-cream placeholder:text-smoke/60 outline-none transition-colors duration-300 focus:border-ember'
const labelCls = 'mb-1 block text-[9px] uppercase tracking-[0.3em] text-smoke'

type Receipt = { id: string; total: number; count: number; name: string; pickup: string }

function Stepper({ qty, onChange, small }: { qty: number; onChange: (q: number) => void; small?: boolean }) {
  return (
    <div className="flex items-center border border-cream/20">
      <button
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
        className={cn('grid place-items-center text-smoke transition-colors hover:text-flame', small ? 'h-7 w-7' : 'h-9 w-9')}
      >
        <Minus size={small ? 11 : 13} />
      </button>
      <span className={cn('grid place-items-center font-serif tabular-nums text-cream', small ? 'w-6 text-sm' : 'w-8')}>
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
        className={cn('grid place-items-center text-smoke transition-colors hover:text-flame', small ? 'h-7 w-7' : 'h-9 w-9')}
      >
        <Plus size={small ? 11 : 13} />
      </button>
    </div>
  )
}

export default function CartDrawer() {
  const { items, count, subtotal, total, setQty, remove, clear, isOpen, closeCart, initialStep } = useCart()
  const { user } = useAuth()

  const [step, setStep] = useState<'cart' | 'pay' | 'done'>(initialStep)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickup, setPickup] = useState(PICKUP_TIMES[0])
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  /* sync the step the drawer was opened with + prefill member name */
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep === 'pay' && count === 0 ? 'cart' : initialStep)
      if (user) setName((n) => n || user.name)
    }
  }, [isOpen, initialStep, count, user])

  /* escape closes */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) return setError('Tell us a name for the order.')
    if (!/^[+\d][\d\s()-]{6,20}$/.test(phone.trim())) return setError('A valid phone number is required for pickup updates.')
    if (card.replace(/\s/g, '').length !== 16) return setError('Card number must be 16 digits (demo — nothing is charged).')
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return setError('Expiry must be MM/YY.')
    if (!/^\d{3,4}$/.test(cvc)) return setError('CVC must be 3–4 digits.')

    setBusy(true)
    const snapshot = { items: items.map(({ id, qty }) => ({ id, qty })), name: name.trim(), phone: phone.trim(), pickupTime: pickup }

    let orderId = `LIA-${Math.floor(1000 + Math.random() * 9000)}`
    let charged = total

    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(snapshot),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Order failed')
        orderId = json.order.id
        charged = json.order.total
      } else {
        /* demo mode — simulate processing, persist locally */
        await new Promise((r) => setTimeout(r, 1400))
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') as unknown[]
        orders.push({ id: orderId, ...snapshot, total, status: 'received', createdAt: Date.now() })
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
      }
      setReceipt({ id: orderId, total: charged, count, name: name.trim(), pickup })
      setStep('done')
      clear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setBusy(false)
    }
  }

  const finish = () => {
    closeCart()
    window.setTimeout(() => {
      setStep('cart')
      setReceipt(null)
      setCard('')
      setExpiry('')
      setCvc('')
    }, 500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="fixed bottom-0 right-0 top-0 z-[75] flex w-full max-w-md flex-col border-l border-cream/10 bg-coal"
            role="dialog"
            aria-label="Your order"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
              <div className="flex items-center gap-3">
                {step === 'pay' && (
                  <button onClick={() => setStep('cart')} aria-label="Back to order" className="text-smoke transition-colors hover:text-flame">
                    <ArrowLeft size={17} />
                  </button>
                )}
                <h2 className="font-serif text-2xl font-medium italic text-cream">
                  {step === 'cart' ? 'Your Order' : step === 'pay' ? 'Checkout' : 'Confirmed'}
                </h2>
                {step === 'cart' && count > 0 && (
                  <span className="rounded-full bg-ember px-2.5 py-0.5 text-[10px] font-semibold text-ink">{count}</span>
                )}
              </div>
              <button onClick={closeCart} aria-label="Close" className="flex h-9 w-9 items-center justify-center border border-cream/15 text-cream/80 transition-colors hover:border-ember">
                <X size={16} />
              </button>
            </div>

            {/* body */}
            {step === 'done' && receipt ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-1 flex-col items-center justify-center px-8 text-center"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-ember text-ember"
                >
                  <Check size={26} />
                </motion.span>
                <h3 className="mt-8 font-serif text-3xl font-medium italic text-cream">The fire has your order</h3>
                <p className="mt-3 font-serif text-5xl font-medium tracking-[0.06em] text-flame">{receipt.id}</p>
                <div className="mt-8 w-full space-y-3 border-t border-cream/10 pt-6 text-sm text-smoke">
                  <p className="flex items-center justify-center gap-2">
                    <Clock size={14} className="text-ember" /> {receipt.pickup}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <MapPin size={14} className="text-ember" /> Collect at the bar — 12 Foundry Row
                  </p>
                  <p className="pt-2 text-xs">
                    {receipt.count} items · {fmt(receipt.total)} · for {receipt.name}
                  </p>
                </div>
                <button
                  onClick={finish}
                  className="group relative mt-10 w-full overflow-hidden border border-ember py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-cream"
                >
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
                  <span className="relative transition-colors duration-300 group-hover:text-ink">Back to the fire</span>
                </button>
              </motion.div>
            ) : step === 'cart' ? (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cream/15 text-smoke">
                        <ShoppingBag size={20} strokeWidth={1.4} />
                      </span>
                      <p className="mt-6 font-serif text-2xl italic text-cream/80">Your order is empty</p>
                      <p className="mt-3 max-w-52 text-xs leading-relaxed text-smoke">
                        Wander through the menu and let the hearth choose for you.
                      </p>
                      <button
                        onClick={closeCart}
                        className="mt-8 border-b border-ember pb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-flame transition-colors hover:text-cream"
                      >
                        Keep browsing
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-5">
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <motion.li
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 44 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="flex gap-4 border-b border-cream/10 pb-5"
                          >
                            <img src={item.img} alt="" className="h-20 w-16 shrink-0 object-cover" />
                            <div className="flex flex-1 flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-serif text-lg leading-tight text-cream">{item.name}</p>
                                <button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`} className="mt-0.5 text-smoke/60 transition-colors hover:text-ember">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <p className="mt-0.5 text-xs text-smoke">{fmt(item.price)} each</p>
                              <div className="mt-3 flex items-center justify-between">
                                <Stepper small qty={item.qty} onChange={(q) => setQty(item.id, q)} />
                                <span className="font-serif text-lg italic text-flame">{fmt(item.price * item.qty)}</span>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-cream/10 px-6 py-6">
                    <div className="space-y-2 text-sm text-smoke">
                      <p className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></p>
                      <p className="flex justify-between"><span>Ember packaging</span><span className="tabular-nums">{fmt(PACKAGING_FEE)}</span></p>
                      <p className="flex justify-between border-t border-cream/10 pt-3 font-serif text-xl text-cream">
                        <span>Total</span><span className="italic tabular-nums">{fmt(total)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setStep('pay')}
                      className="group relative mt-6 w-full overflow-hidden border border-ember py-4.5 py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-cream"
                    >
                      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
                      <span className="relative transition-colors duration-300 group-hover:text-ink">Continue to payment</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* payment step */
              <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
                <div className="space-y-7">
                  <div>
                    <span className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-ember">
                      <UserIcon size={12} /> Pickup contact
                    </span>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="cd-name" className={labelCls}>Name</label>
                        <input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Who collects the fire?" className={fieldCls} />
                      </div>
                      <div>
                        <label htmlFor="cd-phone" className={labelCls}>Phone</label>
                        <input id="cd-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 (312) 555-0000" className={fieldCls} />
                      </div>
                      <div>
                        <label htmlFor="cd-pickup" className={labelCls}>Pickup time</label>
                        <select id="cd-pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} className={fieldCls}>
                          {PICKUP_TIMES.map((t) => (
                            <option key={t} value={t} className="bg-coal">{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-ember">
                      <CreditCard size={12} /> Payment
                    </span>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="cd-card" className={labelCls}>Card number</label>
                        <input id="cd-card" inputMode="numeric" value={card} onChange={(e) => setCard(formatCard(e.target.value))} autoComplete="cc-number" placeholder="4242 4242 4242 4242" className={cn(fieldCls, 'tabular-nums tracking-widest')} />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="cd-exp" className={labelCls}>Expiry</label>
                          <input id="cd-exp" inputMode="numeric" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} autoComplete="cc-exp" placeholder="MM/YY" className={cn(fieldCls, 'tabular-nums')} />
                        </div>
                        <div>
                          <label htmlFor="cd-cvc" className={labelCls}>CVC</label>
                          <input id="cd-cvc" inputMode="numeric" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} autoComplete="cc-csc" placeholder="123" className={cn(fieldCls, 'tabular-nums')} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-smoke">
                      <Phone size={12} className="mt-0.5 shrink-0 text-ember/70" />
                      Demo checkout — no card is charged. Wire Stripe/Adyen server-side for production.
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div role="alert" className="mt-6 flex items-start gap-3 border border-ember/50 bg-ember/10 px-4 py-3 text-xs text-flame">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-auto pt-8">
                  <p className="mb-4 flex justify-between border-t border-cream/10 pt-4 font-serif text-xl text-cream">
                    <span>Total</span>
                    <span className="italic tabular-nums">{fmt(total)}</span>
                  </p>
                  <button
                    type="submit"
                    disabled={busy || count === 0}
                    className="group relative w-full overflow-hidden border border-ember bg-ember py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-ink transition-opacity disabled:opacity-60"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      {busy ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                      {busy ? 'Placing order…' : `Pay ${fmt(total)}`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
