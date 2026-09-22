import type Lenis from 'lenis'

export const lenisRef: { current: Lenis | null } = { current: null }

export function scrollToTarget(target: string, duration = 1.6) {
  if (lenisRef.current) {
    lenisRef.current.scrollTo(target, { duration })
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}
