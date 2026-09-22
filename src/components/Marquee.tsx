import { Flame } from 'lucide-react'

const ITEMS = [
  'Wood-Fired Hearth',
  'Twelve-Course Tasting',
  'One Michelin Star',
  'Natural Wines',
  'Open Late',
  'Seasonal & Local',
]

export default function Marquee() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-cream/10 bg-ink/70 py-5 backdrop-blur-[3px]">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {ITEMS.map((item) => (
              <span key={`${half}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap px-8 font-serif text-2xl italic text-cream/85 md:text-3xl">
                  {item}
                </span>
                <Flame size={15} className="shrink-0 text-ember" fill="currentColor" fillOpacity={0.35} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
