import { Wine } from 'lucide-react'
import MenuList, { MENU_GROUPS } from '../components/MenuList'
import { CTAButton, FadeUp, PageHero } from '../components/shared'
import { scrollToTarget } from '../utils/lenis'
import { useRouter } from '../router'

export default function MenuPage() {
  const { navigate } = useRouter()
  return (
    <>
      <PageHero
        index="02"
        label="Twelve Courses · One Flame"
        title="The"
        accent="Menu"
        sub="Written each morning at the market, burned into memory by night."
      />

      {/* sticky sub-navigation */}
      <div className="sticky top-[65px] z-20 border-y border-cream/10 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-6 py-3 md:px-10">
          {MENU_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => scrollToTarget(`#menu-${g.id}`, 1.2)}
              className="shrink-0 border border-cream/15 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-cream/70 transition-all duration-300 hover:border-ember hover:text-flame"
            >
              {g.label.split('—')[0]}
            </button>
          ))}
        </div>
      </div>

      <section className="relative z-10 px-6 pb-28 pt-16 md:px-10 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <MenuList />

          {/* tasting menu card */}
          <FadeUp className="mt-24">
            <div className="relative overflow-hidden border border-ember/40 bg-coal/70 p-8 backdrop-blur-md md:p-14">
              <span className="absolute -top-px left-12 h-px w-24 bg-ember" />
              <span
                aria-hidden
                className="text-outline pointer-events-none absolute -right-6 -top-8 select-none font-serif text-[9rem] font-semibold leading-none opacity-10 md:text-[13rem]"
              >
                145
              </span>
              <div className="relative flex flex-wrap items-center justify-between gap-10">
                <div className="max-w-lg">
                  <div className="flex items-center gap-3">
                    <Wine size={16} className="text-ember" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ember">
                      The Full Tasting
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-4xl font-medium leading-tight text-cream md:text-5xl">
                    Twelve courses,
                    <br />
                    <span className="italic text-flame">one unbroken fire</span>
                  </h3>
                  <p className="mt-5 text-sm leading-relaxed text-smoke md:text-base">
                    145 per guest · wine pairing 95 · zero-proof pairing 65. Around two
                    and a half hours, start to final ember.
                  </p>
                </div>
                <CTAButton label="Book the tasting" onClick={() => navigate('reserve')} className="px-10 py-5" />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
