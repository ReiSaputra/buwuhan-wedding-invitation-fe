import { QrCode, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type ScanQrCtaProps = {
  /** Rute URL tujuan pemindaian QR */
  to: string
}

/**
 * Komponen Banner Call-to-Action pemindaian QR code tamu saat resepsi.
 * 
 * @param props - Properti ScanQrCta (to)
 */
export function ScanQrCta({ to }: ScanQrCtaProps) {
  return (
    <Link
      to={to}
      className="card-hover-effect group relative flex items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg transition-all duration-300"
    >
      {/* Ornamen dekoratif blur */}
      <span className="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-white/15 blur-sm" />
      <span className="pointer-events-none absolute right-12 -top-12 h-24 w-24 rounded-full bg-pink-400/20 blur-md" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
          <QrCode size={28} />
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white leading-tight">
            Scan QR Tamu Disini
          </h3>
          <p className="mt-0.5 text-xs text-white/80">Check-in cepat di meja resepsionis</p>
        </div>
      </div>

      <div className="relative z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs transition-transform duration-200 group-hover:translate-x-1">
        <ArrowRight size={18} />
      </div>
    </Link>
  )
}