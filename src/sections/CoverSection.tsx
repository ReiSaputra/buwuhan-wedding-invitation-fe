import { motion } from 'framer-motion'
import { MailOpen, Heart, Sparkles } from 'lucide-react'
import { THEME_ELEGAN, type TemplateTheme } from '@/templates/template-themes'

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
  /** Tema visual dari template yang sedang dirender */
  theme?: TemplateTheme
}

/**
 * Komponen Sampul Depan Undangan Digital (Cover Section).
 * Dilengkapi animasi GPU terakselerasi dengan timing optimal bebas lag.
 *
 * @param props - Properti CoverSection (guestName, groomName, brideName, eventDate, onOpen, theme)
 */
export function CoverSection({
  guestName,
  groomName,
  brideName,
  eventDate = 'Minggu, 18 Januari 2026',
  onOpen,
  theme = THEME_ELEGAN,
}: CoverSectionProps) {
  return (
    <section
      data-cover-variant={theme.key}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-10 text-center overflow-hidden ${theme.cover}`}
    >
      {/* Ornamen Latar Belakang */}
      {theme.coverOrnament && (
        <>
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold-blush/40 blur-3xl transform-gpu" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-sage-mist/50 blur-3xl transform-gpu" />
        </>
      )}

      {/* Bagian Atas */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="transform-gpu"
      >
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] ${theme.coverBadge}`}
        >
          <Sparkles size={11} />
          The Wedding Of
        </span>
      </motion.div>

      {/* Bagian Tengah */}
      <div className="my-auto space-y-5 max-w-lg">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className={`mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full p-1 shadow-md transform-gpu ${theme.coverIconRing}`}
        >
          <div
            className={`flex h-full w-full items-center justify-center rounded-full shadow-inner ${theme.coverIconInner}`}
          >
            <Heart size={32} className={`animate-pulse ${theme.coverIcon}`} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
          className="transform-gpu"
        >
          <h1 className={`text-4xl sm:text-5xl leading-tight ${theme.coverTitle}`}>
            <span>{groomName}</span>
            <span className={`mx-2.5 ${theme.coverAmp}`}>&amp;</span>
            <span>{brideName}</span>
          </h1>
          <p className={`mt-2 text-xs sm:text-sm font-medium tracking-widest uppercase ${theme.coverDate}`}>
            {eventDate}
          </p>
        </motion.div>

        {/* Kepada Yth */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: 'easeOut' }}
          className={`px-6 py-4 transform-gpu ${theme.coverCard}`}
        >
          <p className={`text-xs ${theme.coverCardLabel}`}>Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <p className={`mt-1 text-xl sm:text-2xl ${theme.coverCardName}`}>{guestName}</p>
          <p className={`mt-1 text-[11px] ${theme.coverCardNote}`}>
            *Mohon maaf bila ada kesalahan penulisan nama/gelar
          </p>
        </motion.div>
      </div>

      {/* Bagian Bawah */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38, ease: 'easeOut' }}
        className="transform-gpu"
      >
        <button
          type="button"
          onClick={onOpen}
          className={`group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-bold tracking-wider transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer ${theme.coverButton}`}
        >
          <MailOpen size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span>Buka Undangan</span>
        </button>
      </motion.div>
    </section>
  )
}