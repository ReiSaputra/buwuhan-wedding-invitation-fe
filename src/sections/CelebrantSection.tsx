import { motion } from 'framer-motion'
import { Sparkles, Baby, CalendarDays, User } from 'lucide-react'
import type { CelebrantData } from '@/types/invitation-api'

export type CelebrantSectionProps = {
  celebrant: CelebrantData
  eventLabel: string
}

function formatBirthDate(value?: string | null): string | null {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function CelebrantSection({
  celebrant,
  eventLabel,
}: CelebrantSectionProps) {
  const birthDate = formatBirthDate(celebrant.birthDate)

  const childLabel =
    celebrant.gender === 'FEMALE'
      ? 'Putri'
      : celebrant.gender === 'MALE'
        ? 'Putra'
        : 'Anak'

  const childOrder = celebrant.childOrder
    ? `${childLabel} ke-${celebrant.childOrder}`
    : childLabel

  const isAqiqah = eventLabel.toUpperCase() === 'AQIQAH'
  const isKhitanan = eventLabel.toUpperCase() === 'KHITANAN'

  return (
    <section
      id="tokoh-acara"
      className="relative overflow-hidden bg-inv-page-alt px-6 py-20"
    >
      <div className="mx-auto max-w-4xl space-y-12 text-center">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-accent">
            {isKhitanan
              ? 'Walimatul Khitan'
              : isAqiqah
                ? 'Tasyakuran Aqiqah'
                : `Acara ${eventLabel}`}
          </span>
          <h2 className="font-display text-3xl font-bold text-inv-ink sm:text-4xl">
            {isKhitanan
              ? 'Tasyakuran Khitanan Ananda'
              : isAqiqah
                ? 'Karunia & Doa untuk Ananda'
                : 'Maha Suci Allah yang Melimpahkan Rahmat-Nya'}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-lg rounded-3xl border border-inv-gold/30 bg-inv-card p-8 sm:p-10 shadow-lg space-y-5 transform-gpu"
        >
          {/* Avatar Icon Dekoratif */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-inv-accent/20 to-inv-gold/20 p-1.5 shadow-inner">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-inv-page text-inv-accent shadow-xs">
              {isAqiqah ? (
                <Baby size={38} className="text-inv-accent" />
              ) : isKhitanan ? (
                <User size={38} className="text-inv-accent" />
              ) : (
                <Sparkles size={34} className="text-inv-gold" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-inv-ink">
              {celebrant.name}
            </h3>

            {celebrant.nickname && (
              <p className="text-sm font-semibold text-inv-accent">
                ({celebrant.nickname})
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-md mx-auto pt-1">
            {childOrder} dari Bapak{' '}
            <strong className="text-inv-ink font-bold">{celebrant.fatherName}</strong>{' '}
            dan Ibu{' '}
            <strong className="text-inv-ink font-bold">{celebrant.motherName}</strong>
          </p>

          {birthDate && (
            <div className="pt-2 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-inv-page px-4 py-1.5 text-xs font-medium text-slate-600 border border-inv-line/80 shadow-2xs">
                <CalendarDays size={14} className="text-inv-accent" />
                <span>Lahir: {birthDate}</span>
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}