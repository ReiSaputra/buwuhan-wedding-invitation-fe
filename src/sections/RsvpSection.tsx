import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'

export type RsvpSectionProps = {
  guestNameDefault?: string
}

/**
 * Komponen Formulir Konfirmasi Kehadiran Tamu (RSVP Section).
 * Memungkinkan tamu mengonfirmasi kehadiran (Hadir, Ragu, Tidak Hadir),
 * memilih sesi kehadiran, dan menentukan jumlah orang (Pax) yang ikut serta.
 * 
 * @param props - Properti RsvpSection
 */
export function RsvpSection({ guestNameDefault = 'Tamu Undangan' }: RsvpSectionProps) {
  const [name, setName] = useState(guestNameDefault)
  const [attendance, setAttendance] = useState<'HADIR' | 'RAGU' | 'TIDAK_HADIR'>('HADIR')
  const [pax, setPax] = useState('2')
  const [session, setSession] = useState('Sesi 2 (Resepsi Malam)')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Menangani pengiriman data konfirmasi kehadiran RSVP.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 800)
  }

  return (
    <section id="rsvp" className="py-20 px-6 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-sage">
            Reservasi Kehadiran
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Konfirmasi Kehadiran Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Mohon kesediaan Bapak/Ibu/Saudara/i untuk mengisi formulir di bawah ini demi kenyamanan acara.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-md"
        >
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Terima Kasih atas Konfirmasinya!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Data kehadiran <strong>{name}</strong> ({attendance === 'HADIR' ? `Hadir ${pax} Orang` : attendance === 'RAGU' ? 'Masih Ragu' : 'Tidak Dapat Hadir'}) telah tersimpan di sistem kami.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-sage hover:underline cursor-pointer"
              >
                Ubah Konfirmasi Kehadiran
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 focus:bg-white focus:border-sage focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Konfirmasi Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'HADIR', label: 'Pasti Hadir' },
                    { key: 'RAGU', label: 'Masih Ragu' },
                    { key: 'TIDAK_HADIR', label: 'Maaf Berhalangan' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setAttendance(opt.key as any)}
                      className={`rounded-xl p-2.5 text-xs font-semibold border transition cursor-pointer ${
                        attendance === opt.key
                          ? 'border-sage bg-sage text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {attendance === 'HADIR' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">Jumlah Tamu (Pax)</label>
                    <select
                      value={pax}
                      onChange={(e) => setPax(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 focus:bg-white focus:border-sage focus:outline-none transition"
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">Sesi Kehadiran</label>
                    <select
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 focus:bg-white focus:border-sage focus:outline-none transition"
                    >
                      <option value="Sesi 1 (Akad & Siang)">Sesi 1 (Akad & Siang)</option>
                      <option value="Sesi 2 (Resepsi Malam)">Sesi 2 (Resepsi Malam)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sage py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-sage-dark transition cursor-pointer active:scale-98"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi RSVP'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
