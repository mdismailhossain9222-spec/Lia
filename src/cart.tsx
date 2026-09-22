import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/*  LIA online ordering — cart engine                                   */
/*  Item IDs match the server-side price map (server/src/lib.js) —      */
/*  totals are always recomputed on the API, never trusted from client. */
/* ------------------------------------------------------------------ */

export type OrderItem = {
  id: string
  name: string
  note: string
  price: number
  img: string
  category: 'hearth-box' | 'fire' | 'sweet' | 'drink'
}

export const CATEGORIES: { id: OrderItem['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'hearth-box', label: 'Hearth Box' },
  { id: 'fire', label: 'From the Fire' },
  { id: 'sweet', label: 'To End' },
  { id: 'drink', label: 'To Drink' },
]

export const ORDER_ITEMS: OrderItem[] = [
  { id: 'sourdough-smoked-butter', name: 'Sourdough & Smoked Butter', note: 'hearth loaf, embered crust · packed warm', price: 9, img: '/images/embers.jpg', category: 'hearth-box' },
  { id: 'embered-leek-marrow', name: 'Embered Leek & Marrow', note: 'rye crumb, chive blossom', price: 16, img: '/images/dish-1.jpg', category: 'hearth-box' },
  { id: 'cured-trout-juniper', name: 'Cured Trout, Juniper Ash', note: 'ash oil, rye crisp', price: 18, img: '/images/dish-3.jpg', category: 'hearth-box' },
  { id: 'dry-aged-duck', name: 'Dry-Aged Duck, Burnt Cherry', note: 'endive, jus gras', price: 42, img: '/images/dish-2.jpg', category: 'fire' },
  { id: 'wagyu-a5', name: 'Wagyu A5, Charred Allium', note: 'aged shoyu, wasabi leaf', price: 68, img: '/images/dish-3.jpg', category: 'fire' },
  { id: 'whole-turbot', name: 'Whole Turbot, Seaweed Butter', note: 'grilled lemon, sea herbs · for two', price: 54, img: '/images/dish-1.jpg', category: 'fire' },
  { id: 'celeriac-embers', name: 'Celeriac Baked in Embers', note: 'black garlic, hazelnut', price: 34, img: '/images/embers.jpg', category: 'fire' },
  { id: 'cacao-ash', name: 'Cacao, Ash & Smoked Salt', note: 'cold cream, cacao nib', price: 16, img: '/images/dish-4.jpg', category: 'sweet' },
  { id: 'burnt-honey', name: 'Burnt Honey & Sheep Yoghurt', note: 'pollen, oat crumb', price: 14, img: '/images/dish-4.jpg', category: 'sweet' },
  { id: 'smoked-old-fashioned', name: 'Smoked Old Fashioned', note: 'bottled · rye, burnt orange, oak smoke', price: 19, img: '/images/bar.jpg', category: 'drink' },
  { id: 'ember-spritz', name: 'Ember Spritz', note: 'bottled · amaro, charred grapefruit', price: 17, img: '/images/bar.jpg', category: 'drink' },
  { id: 'natural-wine-bottle', name: 'Natural Wine — Bottle', note: "sommelier's pick of the week", price: 58, img: '/images/interior.jpg', category: 'drink' },
]

export type CartItem = { id: string; name: string; price: number; img: string; qty: number }

export const PACKAGING_FEE = 2
export const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const CART_KEY = 'lia.cart.v1'

type CartValue = {
  items: CartItem[]
  count: number
  subtotal: number
  total: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  isOpen: boolean
  openCart: (step?: 'cart' | 'pay') => void
  closeCart: () => void
  initialStep: 'cart' | 'pay'
  lastAdded: { name: string; stamp: number } | null
}

const CartCtx = createContext<CartValue | null>(null)

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)
  const [initialStep, setInitialStep] = useState<'cart' | 'pay'>('cart')
  const [lastAdded, setLastAdded] = useState<CartValue['lastAdded']>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  /* lock page scroll while the drawer is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const add: CartValue['add'] = (item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id)
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: Math.min(20, i.qty + qty) } : i))
      return [...prev, { ...item, qty }]
    })
    setLastAdded({ name: item.name, stamp: Date.now() })
  }

  const setQty: CartValue['setQty'] = (id, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(20, qty) } : i))
    )
  }

  const remove: CartValue['remove'] = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear: CartValue['clear'] = () => setItems([])

  const openCart: CartValue['openCart'] = (step = 'cart') => {
    setInitialStep(step)
    setIsOpen(true)
  }
  const closeCart: CartValue['closeCart'] = () => setIsOpen(false)

  const value = useMemo<CartValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0)
    const total = subtotal > 0 ? subtotal + PACKAGING_FEE : 0
    return {
      items,
      count,
      subtotal,
      total,
      add,
      setQty,
      remove,
      clear,
      isOpen,
      openCart,
      closeCart,
      initialStep,
      lastAdded,
    }
  }, [items, isOpen, initialStep, lastAdded])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}
