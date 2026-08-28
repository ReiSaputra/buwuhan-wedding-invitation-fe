import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

export type QuickActionCardProps = {
  /** Label judul fitur aksi cepat */
  label: string
  /** Rute URL tujuan fitur */
  to: string
  /** Nilai data ringkas opsional */
  value?: string
  /** Elemen icon fitur */
  icon?: ReactNode
}

/**
 * Komponen kartu jalan pintas fitur (Quick Action) pada panel undangan.
 * Memberikan navigasi cepat ke modul Buku Tamu, Kehadiran, Hadiah, Petugas, Template, dll.
 * 

 * @param props - Properti QuickActionCard (label, to, value, icon)
 */
export function QuickActionCard({ label, to, value, icon }: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className="card-hover-effect group flex min-h-[96px] flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs transition-all duration-200 hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-primary border border-indigo-100 transition-transform duration-200 group-hover:scale-110">
              {icon}
            </div>
          )}
          <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition">
            {label}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          className="text-slate-300 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      {value && (
        <div className="pt-2">
          <span className="font-display text-xl font-bold text-ink">{value}</span>
        </div>
      )}
    </Link>
  )
}