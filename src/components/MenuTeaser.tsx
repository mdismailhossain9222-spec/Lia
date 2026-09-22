import { MoveUpRight, ShoppingBag } from 'lucide-react'
import { CTAButton, Eyebrow, FadeUp } from './shared'
import { useRouter } from '../router'

const HIGHLIGHTS = [
  { name: 'Embered Leek & Marrow', price: '16' },
  { name: 'Dry-Aged Duck, Burnt Cherry', price: '42' },
  { name: 'Wagyu A5, Charred Allium', price: '68' },
  { name: 'Cacao, Ash & Smoked Salt', price: '16' },
]

export default function MenuTeaser() {
  const { navigate } = useRouter()
  return (
    <section className="relative z-10 border-y border-cream/10 bg-coal/50 px-6 py-24 backdrop-blur-[2px] md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="03" label="The Menu" />
            <FadeUp delay={0.1}>
              <h2 className="mt-8 font-serif text-4xl font-medium leading-[1.05] text-cream md:text-6xl">
                Tonight, the fire
                <br />
                says <span className="italic text-flame">this</span>
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="pb-1">
            <span className="font-serif text-xl italic text-smoke">( 09 plates · 04 pours )</span>
          </FadeUp>
        </div>

        <FadeUp delay={0.15} className="mt-14">
          {HIGHLIGHTS.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate('menu')}
              className="group flex w-full items-baseline gap-4 border-b border-cream/10 py-5 text-left first:border-t md:py-6"
            >
              <span className="font-serif text-2xl font-medium text-cream/85 transition-all duration-500 group-hover:translate-x-3 group-hover:text-flame md:text-3xl">
                {item.name}
              </span>
              <span className="mx-2 hidden flex-1 border-b border-dotted border-cream/20 sm:block" />
              <span className="ml-auto shrink-0 font-serif text-xl italic text-cream/60 transition-colors duration-300 group-hover:text-flame">
                {item.price}
              </span>
              <MoveUpRight
                size={16}
                className="shrink-0 self-center text-ember opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </button>
          ))}
        </FadeUp>

        <FadeUp delay={0.2} className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <CTAButton label="Explore the full menu" onClick={() => navigate('menu')} />
          <button
            onClick={() => navigate('order')}
            className="group flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.35em] text-cream/70 transition-colors hover:text-flame"
          >
            <span className="border-b border-cream/25 pb-1 transition-colors group-hover:border-flame">
              Or order the fire home
            </span>
            <ShoppingBag size={14} className="text-ember transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </FadeUp>
      </div>
    </section>
  )
}
