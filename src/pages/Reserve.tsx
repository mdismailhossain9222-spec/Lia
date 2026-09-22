import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, ConciergeBell, FileText, MapPin, Phone, Sparkles, Users } from 'lucide-react'
import { EASE, FadeUp, PageHero } from '../components/shared'
import { useRouter } from '../router'
import { useAuth } from '../auth'

const inputCls =
  'w-full border-b border-cream/20 bg-transparent py-3 text-base text-cream placeholder:text-smoke/60 outline-none transition-colors duration-300 focus:border-ember'
const labelCls = 'mb-2 block text-[10px] uppercase tracking-[0.35em] text-smoke'

const TIMES = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00', '21:30', '22:30']
const AREAS = [
  { id: 'Hearth Counter', desc: 'Eight seats facing the coals' },
  { id: 'Dining Room', desc: 'Candlelit, charred timber' },
  { id: "Chef's Table", desc: 'A private room beside the fire' },
]
const INFO = [
  { icon: MapPin, title: '12 Foundry Row', sub: 'West Loop, Chicago' },
  { icon: Clock, title: 'Tue — Sun', sub: '17:30 — 00:00' },
  { icon: Phone, title: '+1 (312) 555-0184', sub: 'parties of 7+, call us' },
]

const STEPS = [
  { label: 'Party', icon: Users },
  { label: 'Seating', icon: Clock },
  { label: 'Details', icon: FileText },
  { label: 'Review', icon: Sparkles },
]

type Data = {
  date: string
  guests: number
  area: string
  time: string
  name: string
  email: string
  occasion: string
  notes: string
}

const panelVariants = {
  enter: { x: 44, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -44, opacity: 0 },
}

export default function Reserve() {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [tried, setTried] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [data, setData] = useState<Data>({
    date: '',
    guests: 2,
    area: 'Dining Room',
    time: '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    occasion: 'Just dinner',
    notes: '',
  })

  const set = <K extends keyof Data>(key: K, value: Data[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const valid =
    step === 0
      ? data.date !== ''
      : step === 1
        ? data.time !== ''
        : step === 2
          ? data.name.trim() !== '' && /\S+@\S+\.\S+/.test(data.email)
          : true

  const next = () => {
    if (!valid) {
      setTried(true)
      return
    }
    setTried(false)
    setStep((s) => Math.min(3, s + 1))
  }

  const hint = !valid && tried

  return (
    <>
      <PageHero
        index="05"
        label="Forty Seats · Two Seatings"
        title="Reserve a"
        accent="Table"
        sub="Four small steps between you and the fire."
      />

      <section className="relative z-10 px-6 pb-32 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-5 lg:gap-20">
          {/* info column */}
          <div className="lg:col-span-2">
            <FadeUp>
              <div className="border-t border-cream/10">
                {INFO.map((row) => (
                  <div key={row.title} className="flex items-center gap-5 border-b border-cream/10 py-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-ember/40 text-ember">
                      <row.icon size={17} strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="font-serif text-xl text-cream">{row.title}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-smoke">{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.15} className="group relative mt-10 overflow-hidden" data-hover>
              <img loading="lazy" decoding="async"
                src="/images/plating.jpg"
                alt="Private dining beside the hearth"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <span className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] uppercase tracking-[0.35em] text-flame">Private hearth</span>
                <span className="mt-2 block font-serif text-2xl italic leading-snug text-cream">
                  The whole room, the whole fire — for parties of eight to fourteen.
                </span>
              </span>
            </FadeUp>
          </div>

          {/* stepper panel */}
          <FadeUp delay={0.1} className="lg:col-span-3">
            <div className="relative border border-cream/10 bg-coal/70 p-7 backdrop-blur-md md:p-12">
              <span className="absolute -top-px left-10 h-px w-20 bg-ember" />

              {/* progress */}
              {!sent && (
                <div className="mb-12">
                  <div className="flex items-center justify-between">
                    {STEPS.map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center gap-2">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                            i < step
                              ? 'border-ember bg-ember text-ink'
                              : i === step
                                ? 'border-ember text-ember'
                                : 'border-cream/15 text-smoke'
                          }`}
                        >
                          {i < step ? <Check size={15} /> : <s.icon size={15} />}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.25em] transition-colors duration-500 ${
                            i <= step ? 'text-cream/80' : 'text-smoke/50'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-px w-full bg-cream/10">
                    <motion.div
                      className="h-px bg-ember"
                      animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex min-h-[380px] flex-col items-center justify-center py-6 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-ember text-ember"
                    >
                      <Check size={26} />
                    </motion.span>
                    <h3 className="mt-8 font-serif text-4xl font-medium italic text-cream md:text-5xl">
                      The hearth is expecting you
                    </h3>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-smoke">
                      {data.name} — {data.area.toLowerCase()}, table for {data.guests}
                      {data.guests >= 7 ? '+' : ''}, {data.date} at {data.time}. A
                      confirmation is on its way to {data.email}.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => {
                          setSent(false)
                          setStep(0)
                          setData({ ...data, date: '', time: '', name: '', email: '', notes: '' })
                        }}
                        className="border border-cream/20 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.3em] text-cream/80 transition-colors hover:border-ember hover:text-flame"
                      >
                        Book another
                      </button>
                      <button
                        onClick={() => navigate('home')}
                        className="border border-ember bg-ember px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.3em] text-ink transition-colors hover:bg-flame"
                      >
                        Back home
                      </button>
                    </div>
                  </motion.div>
                ) : step === 0 ? (
                  <motion.div
                    key="s0"
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <h3 className="font-serif text-3xl font-medium text-cream">
                      When, and <span className="italic text-flame">how many?</span>
                    </h3>
                    <div className="mt-10 grid gap-10 sm:grid-cols-2">
                      <div>
                        <label htmlFor="r-date" className={labelCls}>Date</label>
                        <input
                          id="r-date"
                          type="date"
                          value={data.date}
                          onChange={(e) => set('date', e.target.value)}
                          className={inputCls}
                        />
                        {hint && data.date === '' && (
                          <p className="mt-2 text-xs italic text-ember">Choose an evening</p>
                        )}
                      </div>
                      <div>
                        <span className={labelCls}>Guests</span>
                        <div className="grid grid-cols-7 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((g) => (
                            <button
                              key={g}
                              onClick={() => set('guests', g)}
                              className={`border py-3 font-serif text-lg transition-all duration-300 ${
                                data.guests === g
                                  ? 'border-ember bg-ember text-ink'
                                  : 'border-cream/15 text-cream/70 hover:border-ember/60'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                          <button
                            onClick={() => set('guests', 7)}
                            className={`border py-3 font-serif text-lg transition-all duration-300 ${
                              data.guests >= 7
                                ? 'border-ember bg-ember text-ink'
                                : 'border-cream/15 text-cream/70 hover:border-ember/60'
                            }`}
                          >
                            7+
                          </button>
                        </div>
                        <p className="mt-3 text-xs italic text-smoke">
                          Seven or more? We will call you about the private hearth.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="s1"
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <h3 className="font-serif text-3xl font-medium text-cream">
                      Choose your <span className="italic text-flame">seat by the fire</span>
                    </h3>
                    <div className="mt-10 grid gap-3 sm:grid-cols-3">
                      {AREAS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => set('area', a.id)}
                          className={`border p-5 text-left transition-all duration-300 ${
                            data.area === a.id
                              ? 'border-ember bg-ember/10'
                              : 'border-cream/15 hover:border-ember/50'
                          }`}
                        >
                          <span className={`font-serif text-xl ${data.area === a.id ? 'text-flame' : 'text-cream'}`}>
                            {a.id}
                          </span>
                          <span className="mt-2 block text-xs leading-relaxed text-smoke">{a.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-10">
                      <span className={labelCls}>Seating time</span>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {TIMES.map((t) => (
                          <button
                            key={t}
                            onClick={() => set('time', t)}
                            className={`border py-3 font-serif text-lg transition-all duration-300 ${
                              data.time === t
                                ? 'border-ember bg-ember text-ink'
                                : 'border-cream/15 text-cream/70 hover:border-ember/60'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {hint && data.time === '' && (
                        <p className="mt-2 text-xs italic text-ember">Pick a seating time</p>
                      )}
                    </div>
                  </motion.div>
                ) : step === 2 ? (
                  <motion.div
                    key="s2"
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <h3 className="font-serif text-3xl font-medium text-cream">
                      A few <span className="italic text-flame">details</span>
                    </h3>
                    {user && (
                      <p className="mt-4 inline-flex items-center gap-2 border border-ember/40 bg-ember/10 px-3.5 py-2 text-[10px] uppercase tracking-[0.25em] text-flame">
                        <Check size={12} />
                        Signed in — details prefilled
                      </p>
                    )}
                    {/* honeypot — invisible to humans, traps bots (also rejected server-side) */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="r-company">Company</label>
                      <input
                        id="r-company"
                        name="company"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    <div className="mt-10 grid gap-9 sm:grid-cols-2">
                      <div>
                        <label htmlFor="r-name" className={labelCls}>Name</label>
                        <input
                          id="r-name"
                          value={data.name}
                          onChange={(e) => set('name', e.target.value)}
                          placeholder="Your name"
                          className={inputCls}
                        />
                        {hint && data.name.trim() === '' && (
                          <p className="mt-2 text-xs italic text-ember">We need a name for the table</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="r-email" className={labelCls}>Email</label>
                        <input
                          id="r-email"
                          type="email"
                          value={data.email}
                          onChange={(e) => set('email', e.target.value)}
                          placeholder="you@email.com"
                          className={inputCls}
                        />
                        {hint && !/\S+@\S+\.\S+/.test(data.email) && (
                          <p className="mt-2 text-xs italic text-ember">A valid email for the confirmation</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="r-occasion" className={labelCls}>Occasion</label>
                        <select
                          id="r-occasion"
                          value={data.occasion}
                          onChange={(e) => set('occasion', e.target.value)}
                          className={inputCls}
                        >
                          {['Just dinner', 'Birthday', 'Anniversary', 'Business', 'Proposal'].map((o) => (
                            <option key={o} value={o} className="bg-coal">{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="r-notes" className={labelCls}>Notes · allergies</label>
                        <input
                          id="r-notes"
                          value={data.notes}
                          onChange={(e) => set('notes', e.target.value)}
                          placeholder="Anything we should know"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="s3"
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <h3 className="font-serif text-3xl font-medium text-cream">
                      One last <span className="italic text-flame">look</span>
                    </h3>
                    <div className="mt-10 border-t border-cream/10">
                      {[
                        ['Evening', data.date],
                        ['Time', data.time],
                        ['Party', `${data.guests}${data.guests >= 7 ? '+' : ''} guests · ${data.area}`],
                        ['Name', data.name],
                        ['Email', data.email],
                        ['Occasion', data.occasion],
                        ...(data.notes.trim() ? [['Notes', data.notes]] : []),
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-6 border-b border-cream/10 py-4">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-smoke">{k}</span>
                          <span className="text-right font-serif text-lg italic text-cream">{v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-xs italic text-smoke">
                      No card required. We hold tables for fifteen minutes past the hour.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* controls */}
              {!sent && (
                <div className="mt-12 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className={`flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors ${
                      step === 0 ? 'pointer-events-none opacity-0' : 'text-cream/70 hover:text-flame'
                    }`}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  {step < 3 ? (
                    <button
                      onClick={next}
                      className="group relative overflow-hidden border border-ember px-10 py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-cream"
                    >
                      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-y-100" />
                      <span className="relative transition-colors duration-300 group-hover:text-ink">
                        Continue
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        /* honeypot filled by a bot: accept silently, store nothing */
                        void honeypot
                        setSent(true)
                      }}
                      className="group relative flex items-center gap-3 overflow-hidden border border-ember bg-ember px-10 py-4 text-[10px] font-medium uppercase tracking-[0.35em] text-ink transition-colors duration-300 hover:bg-flame"
                    >
                      <ConciergeBell size={15} />
                      Confirm reservation
                    </button>
                  )}
                </div>
              )}
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
