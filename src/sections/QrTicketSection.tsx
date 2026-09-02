import { motion } from 'framer-motion'
import { QrCode, Sparkles } from 'lucide-react'

export type QrTicketSectionProps = {
  guestName: string
  ticketCode?: string
}

/**
 * Komponen Tiket & Kartu QR Tamu Undangan (E-Ticket Check-in).
 * Ditunjukkan kepada petugas resepsionis di lokasi acara untuk pemindaian instan dan pengambilan souvenir.
 * 
 * @param props - Properti QrTicketSection (guestName, ticketCode)
 */
export function QrTicketSection({
  guestName,
  ticketCode = 'BW-7821-VIP',
}: QrTicketSectionProps) {
  return (
    <section id="tiket" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-sage">
            Access Pass
          </span>
          <h2 className="font-display text-3xl font-bold text-slate-900">
            QR Pass Tamu Undangan
          </h2>
          <p className="text-xs text-slate-600">
            Tunjukkan QR Code ini kepada petugas resepsionis di lokasi resepsi.
          </p>
        </div>

        {/* E-Ticket Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-3xl border-2 border-sage/30 bg-gradient-to-b from-white to-cream p-6 sm:p-8 shadow-xl text-center space-y-6 relative overflow-hidden transform-gpu"
        >
          {/* Header Tiket */}
          <div className="border-b border-dashed border-slate-200 pb-4 space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-gold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Wedding Invitation Pass</span>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Hanung &amp; Ratna
            </h3>
            <p className="text-xs text-slate-500">Minggu, 18 Januari 2026</p>
          </div>

          {/* QR Code Container */}
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 shadow-md border border-slate-200 relative group">
            {/* Simulasi Gambar QR Code */}
            <div className="h-full w-full bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white text-center space-y-2">
              <QrCode size={96} className="text-white" />
              <span className="text-[10px] tracking-widest font-mono font-bold text-amber-300">
                {ticketCode}
              </span>
            </div>
          </div>

          {/* Rincian Data Tamu */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nama Tamu:</span>
              <strong className="text-slate-900 font-bold">{guestName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Alokasi Kursi:</span>
              <span className="font-bold text-sage">Meja VIP 04 (2 Pax)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status Souvenir:</span>
              <span className="font-semibold text-emerald-600">Tersedia</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            *Simpan atau tangkap layar (screenshot) kartu ini untuk kemudahan saat hadir.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
