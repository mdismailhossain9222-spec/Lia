import { Flame } from 'lucide-react'
import { CTAButton, FadeUp, WordReveal } from './shared'
import { useRouter } from '../router'

export default function ReserveCTA() {
  const { navigate } = useRouter()
  return (
    <section className="relative z-10 overflow-hidden px-6 py-32 text-center md:py-44">
      {/* backdrop word */}
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[22vw] font-semibold leading-none opacity-[0.05]"
      >
        reserve
      </span>

      <div className="relative mx-auto max-w-4xl">
        <FadeUp>
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-ember/40 text-ember">
            <Flame size={24} strokeWidth={1.4} fill="currentColor" fillOpacity={0.25} />
          </span>
        </FadeUp>

        <WordReveal
          text="The hearth keeps forty seats a night. One of them is yours."
          accent={['forty', 'yours']}
          className="mt-12 font-serif text-4xl font-medium leading-[1.12] text-cream md:text-6xl lg:text-7xl"
        />

        <FadeUp delay={0.25}>
          <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-smoke md:text-base">
            Two seatings an evening, thirty-day release. Choose the hearth counter and
            watch the coals do the talking.
          </p>
        </FadeUp>

        <FadeUp delay={0.35} className="mt-12">
          <CTAButton label="Reserve a table" onClick={() => navigate('reserve')} className="px-12 py-5" />
        </FadeUp>
      </div>
    </section>
  )
}
