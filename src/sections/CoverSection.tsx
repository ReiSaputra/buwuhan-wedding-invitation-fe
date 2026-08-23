import { motion } from 'framer-motion'
import { MailOpen, Heart, Sparkles } from 'lucide-react'

export type CoverSectionProps = {
  /** Nama tamu undangan yang sedang membuka halaman */
  guestName: string
  /** Nama mempelai pria */
  groomName: string
  /** Nama mempelai wanita */
  brideName: string
  /** Tanggal acara pernikahan */
  eventDate?: string
  /** Callback saat tombol 'Buka Undangan' diklik */
  onOpen: () => void
}

/**
 * Komponen Sampul Depan Undangan Digital (Cover Section).
 * Menampilkan nama kedua mempelai, nama tamu yang dituju, ornamen pernikahan,
 * serta tombol interaktif untuk membuka seluruh isi undangan.
 * 
 * @param props - Properti CoverSection (guestName, groomName, brideName, eventDate, onOpen)
 */
export function CoverSection({
  guestName,
  groomName,
  brideName,
  eventDate = 'Minggu, 18 Januari 2026',
  onOpen,
}: CoverSectionProps) {
  return (
    <section className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-cream via-cream-warm to-cream-deep px-6 py-10 text-center overflow-hidden">
      {/* Ornamen Latar Belakang */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold-blush/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-sage-mist/50 blur-3xl" />

      {/* Bagian Atas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-sage shadow-xs backdrop-blur-xs border border-sage/15">
          <Sparkles size={11} className="text-gold" />
          The Wedding Of
        </span>
      </motion.div>

      {/* Bagian Tengah */}
      <div className="my-auto space-y-5 max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-tr from-gold/30 to-sage/20 p-1 shadow-md"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/90 shadow-inner">
            <Heart size={32} className="text-gold fill-gold/20 animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-night leading-tight">
            <span>{groomName}</span>
            <span className="mx-2.5 text-gold font-serif italic">&amp;</span>
            <span>{brideName}</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium tracking-widest text-sage uppercase">
            {eventDate}
          </p>
        </motion.div>

        {/* Kepada Yth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="rounded-2xl border border-white/80 bg-white/70 px-6 py-4 shadow-xs backdrop-blur-xs"
        >
          <p className="text-xs text-night-muted">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-night">
            {guestName}
          </p>
          <p className="mt-1 text-[11px] text-sage italic">
            *Mohon maaf bila ada kesalahan penulisan nama/gelar
          </p>
        </motion.div>
      </div>

      {/* Bagian Bawah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="group inline-flex items-center gap-2.5 rounded-full bg-sage px-8 py-3.5 text-sm font-bold tracking-wider text-white shadow-lg shadow-sage/30 transition-all duration-200 hover:bg-sage-dark hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
        >
          <MailOpen size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span>Buka Undangan</span>
        </button>
      </motion.div>
    </section>
  )
}