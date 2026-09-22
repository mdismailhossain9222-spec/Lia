import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoveHorizontal, Plus, X } from 'lucide-react'
import { EASE, Eyebrow, PageHero } from '../components/shared'

const SHOTS = [
  { src: '/images/interior.jpg', caption: 'The dining room, after dark', num: '01', aspect: 'aspect-[4/5]' },
  { src: '/images/dish-3.jpg', caption: 'Wagyu A5, charred allium', num: '02', aspect: 'aspect-square' },
  { src: '/images/embers.jpg', caption: 'Binchotan, 900°C', num: '03', aspect: 'aspect-[3/4]' },
  { src: '/images/dish-1.jpg', caption: 'Embered leek & marrow', num: '04', aspect: 'aspect-[4/5]' },
  { src: '/images/bar.jpg', caption: 'Smoke & oak — the bar', num: '05', aspect: 'aspect-[3/4]' },
  { src: '/images/chef.jpg', caption: 'Elena, at the hearth', num: '06', aspect: 'aspect-[4/5]' },
  { src: '/images/dish-2.jpg', caption: 'Dry-aged duck, burnt cherry', num: '07', aspect: 'aspect-square' },
  { src: '/images/plating.jpg', caption: 'Plating, course nine', num: '08', aspect: 'aspect-[3/4]' },
  { src: '/images/dish-4.jpg', caption: 'Cacao, ash, smoked salt', num: '09', aspect: 'aspect-[4/5]' },
]

function DragStrip({ onOpen }: { onOpen: (i: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef(0)
  const [limit, setLimit] = useState(0)

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      const inner = innerRef.current
      if (!track || !inner) return
      setLimit(Math.max(0, inner.scrollWidth - track.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div ref={trackRef} className="relative z-10 overflow-hidden py-4">
      <motion.div
        ref={innerRef}
        drag="x"
        dragConstraints={{ left: -limit, right: 0 }}
        dragElastic={0.06}
        onPointerDown={(e) => {
          dragStart.current = e.clientX
        }}
        className="flex w-max gap-5 px-6 md:px-10"
      >
        {SHOTS.slice(0, 6).map((shot, i) => (
          <motion.button
            key={shot.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
            onClick={(e) => {
              if (Math.abs(e.clientX - dragStart.current) > 10) return
              onOpen(i)
            }}
            className="group relative h-[46vh] w-[70vw] shrink-0 overflow-hidden sm:w-[42vw] md:h-[56vh] md:w-[26vw]"
          >
            <img loading="lazy" decoding="async"
              src={shot.src}
              alt={shot.caption}
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40" />
            <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <span className="text-left text-[10px] uppercase tracking-[0.25em] text-cream/90">
                {shot.caption}
              </span>
              <span className="font-serif italic text-flame">{shot.num}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-smoke">
        <MoveHorizontal size={14} className="text-ember" />
        Drag to explore
      </div>
    </div>
  )
}

function Masonry({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <section className="relative z-10 px-6 pb-28 pt-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Eyebrow index="02" label="The Archive" />
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {SHOTS.map((shot, i) => (
            <motion.button
              key={shot.num}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
              onClick={() => onOpen(i)}
              className={`group relative mb-5 block w-full break-inside-avoid overflow-hidden ${shot.aspect}`}
            >
              <img loading="lazy" decoding="async"
                src={shot.src}
                alt={shot.caption}
                className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-110"
              />
              <span className="absolute inset-0 bg-ink/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 bg-ink/50 text-cream opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
                <Plus size={15} />
              </span>
              <span className="absolute bottom-4 left-4 flex translate-y-2 items-center gap-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="font-serif italic text-flame">{shot.num}</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-cream/90">
                  {shot.caption}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <>
      <PageHero
        index="03"
        label="Nine Frames · One Night"
        title="The"
        accent="Gallery"
        sub="Embers, plates and the room that holds them — shot between services."
      />
      <DragStrip onOpen={setLightbox} />
      <Masonry onOpen={setLightbox} />

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-md"
          >
            <motion.figure
              key={lightbox}
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[82vh] max-w-4xl"
            >
              <img loading="lazy" decoding="async"
                src={SHOTS[lightbox].src}
                alt={SHOTS[lightbox].caption}
                className="max-h-[74vh] w-auto max-w-full object-contain"
              />
              <figcaption className="mt-5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-cream/80">
                  {SHOTS[lightbox].caption}
                </span>
                <span className="font-serif text-lg italic text-flame">
                  {SHOTS[lightbox].num} / 09
                </span>
              </figcaption>
              <button
                onClick={() => setLightbox(null)}
                className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 bg-coal text-cream transition-colors hover:border-ember hover:text-flame"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
