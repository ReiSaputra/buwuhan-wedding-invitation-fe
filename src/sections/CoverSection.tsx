import { motion } from 'framer-motion'

type Props = {
  guestName: string
  groomName: string
  brideName: string
  onOpen: () => void
}

export function CoverSection({ guestName, groomName, brideName, onOpen }: Props) {
  return (
    <section className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-xs tracking-[0.3em] text-sage uppercase"
      >
        Undangan Pernikahan
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-6 font-display text-5xl leading-tight text-ink sm:text-6xl"
      >
        {groomName}
        <span className="mx-3 text-gold">&amp;</span>
        {brideName}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-10"
      >
        <p className="text-sm text-ink/60">Kepada</p>
        <p className="mt-2 font-display text-2xl text-ink">{guestName}</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-12 rounded-full bg-sage px-8 py-3 text-sm font-medium tracking-wide text-white shadow-lg transition hover:bg-sage-dark active:scale-95"
      >
        Buka Undangan
      </motion.button>
    </section>
  )
}