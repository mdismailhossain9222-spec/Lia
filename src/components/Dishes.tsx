import { useRef } from 'react'
import type { MouseEvent as FMMouseEvent } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { MoveUpRight } from 'lucide-react'
import { cn } from '../utils/cn'
import { EASE, Eyebrow, FadeUp } from './shared'
import { useRouter } from '../router'

const DISHES = [
  {
    img: '/images/dish-1.jpg',
    n: '01',
    name: 'Embered Leek',
    sub: 'smoked bone marrow · rye · chive blossom',
    desc: 'Buried in coals overnight, then opened tableside — sweet, smoke-blackened allium under a silk of marrow.',
    price: '16',
  },
  {
    img: '/images/dish-2.jpg',
    n: '02',
    name: 'Dry-Aged Duck',
    sub: 'burnt cherry · endive · jus gras',
    desc: 'Forty-five days aged, kissed by cherrywood flame and lacquered in its own dark, glossy jus.',
    price: '42',
  },
  {
    img: '/images/dish-3.jpg',
    n: '03',
    name: 'Wagyu A5',
    sub: 'charred allium · aged shoyu · wasabi leaf',
    desc: 'A slow pass over binchotan, nothing more. Beef that melts like the embers it was born above.',
    price: '68',
  },
  {
    img: '/images/dish-4.jpg',
    n: '04',
    name: 'Cacao & Ash',
    sub: 'smoked salt · torched meringue · cold cream',
    desc: 'Bitter cacao cremeux under meringue burnt to ash — the last thing you taste is the fire itself.',
    price: '16',
  },
]

/* Tilting parallax image card */
function DishImage({ src, alt }: { src: string; alt: string }) {
  const wrap = useRef<HTMLDivElement>(null)

  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 })

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])

  const onMove = (e: FMMouseEvent<HTMLDivElement>) => {
    const rect = wrap.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * 10)
    rx.set(-py * 10)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div ref={wrap} style={{ perspective: 1000 }} className="group" data-hover>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.15, ease: EASE }}
          className="relative aspect-[4/5] overflow-hidden"
        >
          <motion.img loading="lazy" decoding="async"
            src={src}
            alt={alt}
            style={{ y: parallaxY }}
            className="absolute inset-0 h-[120%] w-full scale-[1.02] object-cover transition-[scale,filter] duration-700 ease-out will-change-transform group-hover:scale-[1.07] group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/10 opacity-60 transition-opacity duration-700 group-hover:opacity-20" />
        </motion.div>
        {/* offset frame */}
        <div className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-full w-full border border-ember/30 transition-transform duration-700 group-hover:translate-x-2 group-hover:translate-y-2" />
      </motion.div>
    </div>
  )
}

export default function Dishes() {
  const { navigate } = useRouter()
  return (
    <section id="dishes" className="relative z-10 px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow index="02" label="Signature Plates" />
            <FadeUp delay={0.1}>
              <h2 className="mt-8 font-serif text-5xl font-medium leading-[1.02] text-cream md:text-7xl">
                Born of the <span className="italic text-flame">hearth</span>
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="hidden pb-2 md:block">
            <span className="font-serif text-2xl italic text-smoke">( 04 )</span>
          </FadeUp>
        </div>

        <div className="mt-20 md:mt-28">
          {DISHES.map((dish, i) => {
            const odd = i % 2 === 1
            return (
              <div
                key={dish.n}
                className={cn(
                  'grid items-center gap-10 border-t border-cream/10 py-16 md:grid-cols-12 md:gap-12 md:py-24',
                  i === 0 && 'border-t-0 pt-0 md:pt-0'
                )}
              >
                {/* image */}
                <div
                  className={cn(
                    'md:col-span-5',
                    odd ? 'md:order-2 md:col-start-8' : 'md:order-1'
                  )}
                >
                  <DishImage src={dish.img} alt={dish.name} />
                </div>

                {/* copy */}
                <div
                  className={cn(
                    'md:col-span-6',
                    odd ? 'md:order-1 md:col-start-1' : 'md:order-2 md:col-start-7'
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-12%' }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="font-serif text-lg italic text-ember">{dish.n}</span>
                      <span className="h-px flex-1 bg-cream/10" />
                      <span className="font-serif text-2xl italic text-flame">{dish.price}</span>
                    </div>
                    <h3 className="mt-6 font-serif text-5xl font-medium leading-[1.02] text-cream transition-colors duration-300 md:text-6xl lg:text-7xl">
                      {dish.name}
                    </h3>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-ember/90">
                      {dish.sub}
                    </p>
                    <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
                      {dish.desc}
                    </p>
                    <button
                      onClick={() => navigate('menu')}
                      className="group mt-9 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-cream/80 transition-colors hover:text-flame"
                    >
                      <span className="border-b border-cream/25 pb-1 transition-colors group-hover:border-flame">
                        See full menu
                      </span>
                      <MoveUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
