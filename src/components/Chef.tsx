import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Quote } from 'lucide-react'
import { EASE, Eyebrow, FadeUp } from './shared'

export default function Chef() {
  const imgWrap = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: imgWrap,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])

  return (
    <section id="chef" className="relative z-10 overflow-hidden px-6 py-28 md:px-10 md:py-40">
      {/* backdrop word */}
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[24vw] font-semibold leading-none opacity-[0.07]"
      >
        keeper
      </span>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2 lg:gap-24">
        {/* portrait */}
        <motion.div
          ref={imgWrap}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden"
        >
          <motion.img loading="lazy" decoding="async"
            src="/images/chef.jpg"
            alt="Chef Elena Marchetti in front of the open hearth"
            style={{ y: imgY }}
            className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cream/90">
            <span>At the hearth</span>
            <span className="font-serif text-sm italic text-flame">fig. 02</span>
          </div>
        </motion.div>

        {/* quote */}
        <div>
          <Eyebrow index="04" label="The Chef" />
          <FadeUp delay={0.15} className="mt-10">
            <Quote size={30} className="rotate-180 text-ember" fill="currentColor" fillOpacity={0.25} strokeWidth={1} />
          </FadeUp>
          <FadeUp delay={0.2}>
            <blockquote className="mt-6 font-serif text-4xl font-medium italic leading-[1.15] text-cream md:text-5xl lg:text-6xl">
              Fire is the only ingredient you cannot buy. You earn it — every single night.
            </blockquote>
          </FadeUp>
          <FadeUp delay={0.3} className="mt-10 flex items-center gap-5">
            <span className="h-px w-14 bg-ember/70" />
            <div>
              <p className="font-serif text-2xl italic text-flame">Elena Marchetti</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-smoke">
                Chef & Keeper of the Flame
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.4}>
            <p className="mt-10 max-w-md text-base leading-relaxed text-smoke">
              After a decade in the kitchens of San Sebastián and Copenhagen, Elena came
              home to Chicago with a single conviction: that a log of oak, burned slowly,
              is the most honest way to cook.
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
