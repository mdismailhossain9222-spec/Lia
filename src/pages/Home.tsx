import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Dishes from '../components/Dishes'
import MenuTeaser from '../components/MenuTeaser'
import ReserveCTA from '../components/ReserveCTA'
import { CTAButton, Eyebrow, FadeUp, WordReveal } from '../components/shared'
import { useRouter } from '../router'

function HomePhilosophy() {
  const { navigate } = useRouter()
  return (
    <section className="relative z-10 px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Eyebrow index="01" label="Philosophy" />
        <WordReveal
          text="We cook the way fire intended — slowly, seasonally, and without apology."
          accent={['fire', 'slowly', 'apology']}
          className="mt-10 max-w-5xl font-serif text-4xl font-medium leading-[1.12] text-cream md:text-6xl lg:text-7xl"
          delay={0.1}
        />
        <div className="mt-14 flex flex-wrap items-center justify-between gap-8">
          <FadeUp delay={0.15}>
            <p className="max-w-md text-sm leading-relaxed text-smoke md:text-base">
              No gas, no shortcuts. Oak, ember and patience — tended by hand from first
              service to last coal.
            </p>
          </FadeUp>
          <FadeUp delay={0.25}>
            <CTAButton label="Read our story" onClick={() => navigate('story')} />
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

export default function Home({ started }: { started: boolean }) {
  return (
    <>
      <Hero started={started} />
      <Marquee />
      <HomePhilosophy />
      <Dishes />
      <MenuTeaser />
      <ReserveCTA />
    </>
  )
}
