import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Flame, Hammer, Leaf } from 'lucide-react'
import Philosophy from '../components/Philosophy'
import Chef from '../components/Chef'
import { EASE, Eyebrow, FadeUp, PageHero } from '../components/shared'

const TIMELINE = [
  {
    year: '2017',
    title: 'A match is struck',
    text: 'Elena finds a derelict foundry in the West Loop and lights the first oak fire where the furnaces once stood.',
  },
  {
    year: '2019',
    title: 'The star arrives',
    text: 'Eighteen months in, the inspectors come twice — and Lia takes home its first Michelin star.',
  },
  {
    year: '2022',
    title: 'The hearth, rebuilt',
    text: 'The kitchen is torn out and rebuilt around a single open hearth. No gas line has entered the building since.',
  },
  {
    year: '2025',
    title: 'Twelve courses',
    text: 'The menu finds its final form: one unbroken tasting, from raw to ember to ash, changing with each market morning.',
  },
]

const VALUES = [
  {
    icon: Flame,
    title: 'Wood',
    text: 'Oak and cherrywood only, seasoned eighteen months in our own yard.',
  },
  {
    icon: Leaf,
    title: 'Season',
    text: 'The market writes the menu. We simply translate it into smoke.',
  },
  {
    icon: Hammer,
    title: 'Craft',
    text: 'Everything — from the foeder-fermented bread to the plates — made by hand.',
  },
]

function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end 0.6'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <section className="relative z-10 px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-5xl">
        <Eyebrow index="02" label="The Timeline" />
        <FadeUp delay={0.1}>
          <h2 className="mt-8 font-serif text-4xl font-medium text-cream md:text-6xl">
            Nine years of <span className="italic text-flame">fire</span>
          </h2>
        </FadeUp>

        <div ref={ref} className="relative mt-20 md:mt-24">
          {/* rail */}
          <span className="absolute left-[19px] top-0 h-full w-px bg-cream/10 md:left-1/2" />
          <motion.span
            style={{ scaleY: lineScale }}
            className="absolute left-[19px] top-0 h-full w-px origin-top bg-gradient-to-b from-ember via-flame to-ember md:left-1/2"
          />

          <div className="space-y-20 md:space-y-28">
            {TIMELINE.map((item, i) => {
              const left = i % 2 === 0
              return (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 44 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-18%' }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className={`relative flex md:w-1/2 ${left ? 'md:pr-16' : 'md:ml-auto md:pl-16'} pl-14 md:pl-0`}
                >
                  {/* node */}
                  <span
                    className={`absolute top-2 flex h-10 w-10 items-center justify-center rounded-full border border-ember/60 bg-ink ${
                      left ? 'left-0 md:left-auto md:-right-5' : 'left-0 md:-left-5'
                    }`}
                  >
                    <Flame size={14} className="text-ember" fill="currentColor" fillOpacity={0.35} />
                  </span>
                  <div className={left ? '' : 'md:ml-0'}>
                    <span className="font-serif text-5xl font-medium italic text-flame/90 md:text-6xl">
                      {item.year}
                    </span>
                    <h3 className="mt-3 font-serif text-2xl font-medium text-cream md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-smoke md:text-base">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function Values() {
  return (
    <section className="relative z-10 px-6 pb-28 md:px-10 md:pb-36">
      <div className="mx-auto max-w-6xl">
        <Eyebrow index="04" label="What We Keep" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.1}>
              <div
                data-hover
                className="group relative h-full border border-cream/10 bg-coal/50 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-ember/50 hover:bg-coal/80 md:p-10"
              >
                <span className="absolute -top-px left-8 h-px w-14 bg-ember/0 transition-colors duration-500 group-hover:bg-ember" />
                <span className="flex h-12 w-12 items-center justify-center border border-ember/40 text-ember transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <v.icon size={20} strokeWidth={1.5} />
                </span>
                <h3 className="mt-8 font-serif text-3xl font-medium italic text-cream">{v.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-smoke">{v.text}</p>
                <span className="mt-8 block font-serif text-lg italic text-ember/60">
                  0{i + 1}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Story() {
  return (
    <>
      <PageHero
        index="01"
        label="Since 2017 · West Loop"
        title="Our"
        accent="Story"
        sub="A derelict foundry, one stubborn chef, and a fire that never went out."
      />
      <Philosophy />
      <Timeline />
      <Chef />
      <Values />
    </>
  )
}
