import { ArrowUp, MoveUpRight } from 'lucide-react'
import { FadeUp } from './shared'
import { useRouter } from '../router'
import type { PageId } from '../router'
import { lenisRef } from '../utils/lenis'

const SOCIALS = ['Instagram', 'Facebook', 'TikTok']

const PAGE_LINKS: { label: string; page: PageId }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Menu', page: 'menu' },
  { label: 'Story', page: 'story' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'Order', page: 'order' },
  { label: 'Reserve', page: 'reserve' },
  { label: 'Members', page: 'login' },
]

export default function Footer() {
  const { navigate } = useRouter()

  const toTop = () => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.4 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative z-10 overflow-hidden border-t border-cream/10 px-6 pt-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <FadeUp className="flex flex-col items-center text-center">
          <span className="text-[10px] uppercase tracking-[0.45em] text-smoke">
            Until the last ember
          </span>
          <button
            onClick={() => navigate('reserve')}
            className="group relative mt-8 select-none font-serif text-[clamp(4rem,17vw,15rem)] font-semibold leading-[0.95] tracking-[0.04em]"
            aria-label="Reserve a table at Lia"
          >
            <span className="bg-gradient-to-b from-cream via-flame to-wine bg-clip-text text-transparent transition-all duration-700 group-hover:from-flame group-hover:via-ember group-hover:to-wine">
              LIA
            </span>
            <span className="absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-ember transition-all duration-700 group-hover:w-full" />
          </button>
          <p className="mt-8 max-w-md font-serif text-xl italic text-cream/70 md:text-2xl">
            Twelve courses. One flame. Every night until the wood runs out.
          </p>
        </FadeUp>

        <FadeUp delay={0.05} className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PAGE_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-cream/60 transition-colors hover:text-flame"
            >
              {link.label}
            </button>
          ))}
        </FadeUp>

        <FadeUp delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s}
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label={s}
              className="group flex items-center gap-2 rounded-full border border-cream/15 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.3em] text-cream/70 transition-all duration-300 hover:-translate-y-1 hover:border-ember hover:text-flame"
            >
              {s}
              <MoveUpRight
                size={12}
                className="text-ember transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </FadeUp>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-cream/10 py-8 text-[10px] uppercase tracking-[0.3em] text-smoke md:flex-row">
          <span>© 2026 Lia — Chicago</span>
          <span className="font-serif text-sm normal-case italic tracking-normal text-smoke/80">
            cooked slowly, served warmly
          </span>
          <button
            onClick={toTop}
            className="group flex items-center gap-3 text-cream/70 transition-colors hover:text-flame"
          >
            Back to top
            <span className="flex h-9 w-9 items-center justify-center border border-cream/15 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-ember">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
