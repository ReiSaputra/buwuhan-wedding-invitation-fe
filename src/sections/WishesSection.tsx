import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, XCircle, Clock, MessageSquareDashed } from 'lucide-react'
import { usePublicWishes, useSubmitRsvp, formatTimeAgo } from '@/hooks/usePublicWishes'
import { parseApiError } from '@/lib/errorHandler'
import type { ApiRsvpStatus } from '@/types/invitation-api'

export type WishesSectionProps = {
  /** Slug undangan yang sedang dibuka */
  slug: string
  /** Nama tamu dari parameter URL, dipakai sebagai nilai awal kolom nama */
  guestNameDefault?: string
}

/** Pilihan status kehadiran, mengikuti enum RSVPStatus di backend. */
const ATTENDANCE_OPTIONS: Array<{ value: ApiRsvpStatus; label: string }> = [
  { value: 'CONFIRMED', label: 'Ya, saya akan hadir' },
  { value: 'DECLINED', label: 'Maaf, saya berhalangan' },
]

/**
 * Komponen Buku Ucapan & Doa Restu (Wishes Section).
 * Memuat ucapan tamu dari backend, serta mengirim konfirmasi kehadiran
 * dan ucapan baru melalui endpoint RSVP publik.
 *
 * @param props - Properti WishesSection (slug, guestNameDefault)
 */
export function WishesSection({ slug, guestNameDefault = '' }: WishesSectionProps) {
  const { wishes, isLoading } = usePublicWishes(slug)
  const submitRsvp = useSubmitRsvp(slug)

  const [name, setName] = useState(
    guestNameDefault === 'Tamu Undangan' ? '' : guestNameDefault,
  )
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<ApiRsvpStatus>('CONFIRMED')
  const [reservation, setReservation] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  /**
   * Mengirim konfirmasi kehadiran dan ucapan doa restu tamu ke backend.
   */
  async function handleSendWish(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !message.trim()) return

    setErrorMessage(null)

    try {
      await submitRsvp.mutateAsync({
        name: name.trim(),
        status,
        message: message.trim(),
        reservation: status === 'CONFIRMED' ? reservation : 0,
      })

      setMessage('')
      setIsSent(true)
    } catch (error) {
      const parsed = parseApiError(error)
      setErrorMessage(parsed.generalMessage)
    }
  }

  return (
    <section id="ucapan" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Buku Ucapan
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Kirimkan Doa &amp; Ucapan Restu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Untaian kata dan doa tulus Anda adalah kebahagiaan tak ternilai bagi kami berdua.
          </p>
        </div>

        {/* Form Kirim Ucapan */}
        <div className="rounded-3xl border border-border bg-cream p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSendWish} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nama Anda</label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  placeholder="Nama pengirim..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-sage focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApiRsvpStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-sage focus:outline-none transition"
                >
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {status === 'CONFIRMED' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Jumlah Orang yang Hadir
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={reservation}
                  onChange={(e) => setReservation(Number(e.target.value) || 1)}
                  className="w-full sm:w-32 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-sage focus:outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ucapan &amp; Doa Restu
              </label>
              <textarea
                required
                rows={3}
                maxLength={1000}
                placeholder="Tuliskan doa restu dan ucapan selamat untuk kedua mempelai..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-sage focus:outline-none transition resize-none"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            {isSent && !errorMessage && (
              <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-700">
                Terima kasih! Ucapan Anda sudah kami terima.
              </p>
            )}

            <button
              type="submit"
              disabled={submitRsvp.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-sage px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-sage-dark transition cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              <span>{submitRsvp.isPending ? 'Mengirim...' : 'Kirim Ucapan'}</span>
            </button>
          </form>
        </div>

        {/* Linimasa Daftar Ucapan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isLoading ? 'Memuat ucapan...' : `Total ${wishes.length} Ucapan Masuk`}
            </h4>
          </div>

          {!isLoading && wishes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 py-12 text-center">
              <MessageSquareDashed size={28} className="mx-auto text-slate-400" />
              <p className="mt-3 text-xs text-slate-500">
                Belum ada ucapan. Jadilah yang pertama mengirim doa restu.
              </p>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {wishes.map((wish) => (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sage to-gold text-white font-bold text-xs shadow-xs uppercase">
                      {wish.guestName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{wish.guestName}</p>
                      {wish.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                          <CheckCircle2 size={10} />
                          Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">
                          <XCircle size={10} />
                          Berhalangan
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Clock size={11} />
                    {formatTimeAgo(wish.createdAt)}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 pt-1 font-serif italic whitespace-pre-line">
                  "{wish.message}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}