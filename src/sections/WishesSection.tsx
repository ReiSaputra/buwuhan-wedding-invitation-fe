import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, Clock } from 'lucide-react'

type WishItem = {
  id: string
  name: string
  attendance: string
  message: string
  timeAgo: string
}

const INITIAL_WISHES: WishItem[] = [
  {
    id: 'w1',
    name: 'Budi Santoso & Istri',
    attendance: 'Pasti Hadir',
    message: 'Selamat berbahagia Han & Ratna! Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah sampai akhir hayat.',
    timeAgo: '10 menit yang lalu',
  },
  {
    id: 'w2',
    name: 'Siti Rahmawati',
    attendance: 'Pasti Hadir',
    message: 'Barakallahu laka wa baraka alaika wa jamaa bainakuma fii khair. Cantik dan gagah sekali pengantinnya!',
    timeAgo: '1 jam yang lalu',
  },
  {
    id: 'w3',
    name: 'Dimas Wicaksono',
    attendance: 'Berhalangan',
    message: 'Mohon maaf belum bisa hadir langsung karena dinas luar kota. Doa terbaik dan lancar acaranya kawan!',
    timeAgo: '3 jam yang lalu',
  },
]

/**
 * Komponen Buku Ucapan & Doa Restu (Wishes Section).
 * Memungkinkan tamu menulis ucapan dan langsung melihat komentar terbit di linimasa.
 */
export function WishesSection() {
  const [wishes, setWishes] = useState<WishItem[]>(INITIAL_WISHES)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState('Pasti Hadir')
  const [isSending, setIsSending] = useState(false)

  /**
   * Menangani pengiriman ucapan doa restu baru ke linimasa.
   */
  function handleSendWish(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setIsSending(true)
    setTimeout(() => {
      const newWish: WishItem = {
        id: `w-${Date.now()}`,
        name,
        attendance,
        message,
        timeAgo: 'Baru saja',
      }
      setWishes([newWish, ...wishes])
      setName('')
      setMessage('')
      setIsSending(false)
    }, 600)
  }

  return (
    <section id="ucapan" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
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
        <div className="rounded-3xl border border-border bg-[#faf7f2] p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSendWish} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nama Anda</label>
                <input
                  type="text"
                  required
                  placeholder="Nama pengirim..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#526b5d] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Status Kehadiran</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#526b5d] focus:outline-none transition"
                >
                  <option value="Pasti Hadir">Pasti Hadir</option>
                  <option value="Masih Ragu">Masih Ragu</option>
                  <option value="Berhalangan">Berhalangan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Ucapan & Doa Restu</label>
              <textarea
                required
                rows={3}
                placeholder="Tuliskan doa restu dan ucapan selamat untuk kedua mempelai..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#526b5d] focus:outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#526b5d] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#3c5044] transition cursor-pointer active:scale-95"
            >
              <Send size={14} />
              <span>{isSending ? 'Mengirim...' : 'Kirim Ucapan'}</span>
            </button>
          </form>
        </div>

        {/* Linimasa Daftar Ucapan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total {wishes.length} Ucapan Masuk
            </h4>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#526b5d] to-[#c59b27] text-white font-bold text-xs shadow-xs uppercase">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{w.name}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                        <CheckCircle2 size={10} />
                        {w.attendance}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={11} />
                    {w.timeAgo}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 pt-1 font-serif italic">
                  "{w.message}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
