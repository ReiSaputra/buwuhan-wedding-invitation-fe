import { motion } from 'framer-motion'
import { Baby, CalendarDays, Users } from 'lucide-react'
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

  return (
    <section
      id="tokoh-acara"
      className="relative overflow-hidden bg-inv-page-alt px-6 py-20"
    >
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-2 transform-gpu"
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-accent">
            Tokoh Utama {eventLabel}
          </span>

          <h2 className="font-display text-3xl font-bold text-inv-ink sm:text-4xl">
            {celebrant.name}
          </h2>

          {celebrant.nickname && (
            <p className="text-sm font-semibold text-inv-accent">
              ({celebrant.nickname})
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: 'easeOut',
          }}
          className="mx-auto max-w-xl rounded-3xl border border-inv-gold/30 bg-inv-card p-6 shadow-md sm:p-8 transform-gpu"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-inv-gold/15 text-inv-gold">
            <Baby size={36} aria-hidden="true" />
          </div>

          <div className="grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-inv-page p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-inv-accent">
                <Users size={15} aria-hidden="true" />
                Orang Tua
              </div>

              <p className="text-sm leading-relaxed text-inv-ink">
                {childOrder} dari Bapak{' '}
                <strong>{celebrant.fatherName}</strong> dan Ibu{' '}
                <strong>{celebrant.motherName}</strong>
              </p>
            </div>

            <div className="rounded-2xl bg-inv-page p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-inv-accent">
                <CalendarDays size={15} aria-hidden="true" />
                Tanggal Lahir
              </div>

              <p className="text-sm leading-relaxed text-inv-ink">
                {birthDate ?? 'Tidak dicantumkan'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}