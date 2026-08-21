import { QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ScanQrCta({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-primary px-6 py-6 text-white transition hover:bg-primary-dark active:scale-[0.99]"
    >
      {/* Ornamen dekoratif seperti di desain */}
      <span className="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute right-10 -top-12 h-24 w-24 rounded-full bg-white/5" />

      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <QrCode size={28} />
      </span>
      <span className="relative font-semibold">Scan QR Tamu disini</span>
    </Link>
  )
}