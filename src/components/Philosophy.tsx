import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Flame } from 'lucide-react'
import { EASE, Eyebrow, FadeUp, WordReveal } from './shared'

const STATS = [
  { value: '01', label: 'Michelin Star' },
  { value: '12', label: 'Course Tasting' },
  { value: '900°', label: 'Hearth Heat' },
  { value: '2017', label: 'Est. Chicago' },
]

export default function Philosophy() {
  const imgWrap = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: imgWrap,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section id="philosophy" className="relative z-10 px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Eyebrow index="01" label="Philosophy" />

        <WordReveal
          text="We cook the way fire intended — slowly, seasonally, and without apology."
          accent={['fire', 'slowly', 'apology']}
          className="mt-10 max-w-5xl font-serif text-4xl font-medium leading-[1.12] text-cream md:text-6xl lg:text-7xl"
          delay={0.1}
        />

        <div className="mt-20 grid gap-14 md:grid-cols-12 md:gap-10 lg:gap-20">
          {/* copy */}
          <div className="flex flex-col justify-between md:col-span-6 lg:col-span-5">
            <FadeUp delay={0.15}>
              <p className="max-w-md text-base leading-relaxed text-smoke md:text-lg">
                Every plate at Lia begins as a log of oak in our open hearth. No gas,
                no shortcuts — a twelve-course dialogue between the season and the flame,
                served in a room built of charred timber and candlelight.
              </p>
              <p className="mt-6 max-w-md text-base leading-relaxed text-smoke md:text-lg">
                Our menu changes with the market each morning. What never changes is the
                fire — tended by hand, from first service to last ember.
              </p>
            </FadeUp>

            <FadeUp delay={0.25} className="mt-14">
              <div className="grid grid-cols-2 border-t border-cream/10">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
                    className="border-b border-cream/10 py-7 pr-6 odd:border-r odd:border-cream/10 md:py-9"
                  >
                    <p className="font-serif text-4xl font-medium text-cream md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-smoke">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* image */}
          <div className="md:col-span-6 lg:col-span-7">
            <motion.div
              ref={imgWrap}
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, margin: '-12%' }}
              transition={{ duration: 1.2, ease: EASE }}
              className="relative aspect-[4/5] overflow-hidden md:aspect-[5/5]"
            >
              <motion.img loading="lazy" decoding="async"
                src="/images/interior.jpg"
                alt="The candlelit dining room of Lia with open hearth"
                style={{ y: imgY }}
                className="absolute inset-0 h-[122%] w-full object-cover will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-3 border border-cream/15 bg-ink/60 px-4 py-2.5 backdrop-blur-md">
                <Flame size={14} className="text-ember" fill="currentColor" fillOpacity={0.35} />
                <span className="text-[10px] uppercase tracking-[0.3em] text-cream/90">
                  The Hearth — 900°C
                </span>
              </div>
            </motion.div>
            <FadeUp delay={0.2} className="mt-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-smoke">
                The dining room, after dark
              </span>
              <span className="font-serif italic text-flame">fig. 01</span>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}
