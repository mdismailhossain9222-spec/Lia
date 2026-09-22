import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Scene3D from './components/three/Scene3D'
import { EASE } from './components/shared'
import { lenisRef } from './utils/lenis'
import { RouterProvider, useRouter } from './router'
import { AuthProvider } from './auth'
import { CartProvider } from './cart'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import MenuPage from './pages/MenuPage'
import Story from './pages/Story'
import Gallery from './pages/Gallery'
import Reserve from './pages/Reserve'
import Order from './pages/Order'
import Login from './pages/Login'

/* film grain overlay */
function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: '220px 220px',
      }}
    />
  )
}

function PageSwitch({ started }: { started: boolean }) {
  const { page } = useRouter()
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={page}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -22 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {page === 'home' && <Home started={started} />}
        {page === 'menu' && <MenuPage />}
        {page === 'story' && <Story />}
        {page === 'gallery' && <Gallery />}
        {page === 'reserve' && <Reserve />}
        {page === 'order' && <Order />}
        {page === 'login' && <Login />}
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const finish = useCallback(() => setLoading(false), [])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    lenisRef.current = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return (
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <div className="relative min-h-screen bg-ink font-sans text-cream">
            <AnimatePresence>
              {loading && <Preloader key="preloader" onDone={finish} />}
            </AnimatePresence>

            <Scene3D />
            <Grain />
            <Cursor />
            <Navbar />
            <CartDrawer />

            <PageSwitch started={!loading} />
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
