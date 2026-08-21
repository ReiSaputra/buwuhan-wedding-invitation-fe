import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { TrendingUp } from 'lucide-react'

export type StatCardVariant = 'plain' | 'filled' | 'gradient'

export type StatCardProps = {
  /** Label judul metrik statistik */
  label: string
  /** Nilai angka atau nominal metrik */
  value: number | string
  /** Icon penanda kategori metrik */
  icon?: ReactNode
  /** Catatan atau deskripsi kecil di bawah nilai */
  hint?: string
  /** Persentase tren kenaikan atau status tren (misal: "+12%") */
  trend?: string
  /** Varian tampilan visual kartu */
  variant?: StatCardVariant
  /** Warna aksen ikon (indigo, emerald, violet, amber) */
  colorAccent?: 'indigo' | 'emerald' | 'violet' | 'amber'
}

const accentIconBg = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  violet: 'bg-purple-50 text-purple-600 border-purple-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
}

/**
 * Komponen kartu metrik statistik dashboard.
 * Menampilkan data angka kunci, icon aksen, tren performa, dan efek hover modern.
 * 
 * @param props - Properti StatCard (label, value, icon, hint, trend, variant, colorAccent)
 */
export function StatCard({
  label,
  value,
  icon,
  hint,
  trend,
  variant = 'plain',
  colorAccent = 'indigo',
}: StatCardProps) {
  const isFilled = variant === 'filled'
  const isGradient = variant === 'gradient'

  if (isFilled || isGradient) {
    return (
      <div
        className={cn(
          'card-hover-effect relative overflow-hidden rounded-2xl p-5 shadow-sm text-white',
          isGradient
            ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
            : 'bg-primary border border-indigo-600/30',
        )}
      >
        {/* Ornamen dekoratif blur */}
        <span className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xs" />

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white/80 tracking-wide">{label}</p>
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs">
              {icon}
            </span>
          )}
        </div>

        <p className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>

        {hint && <p className="mt-2 text-xs text-white/70">{hint}</p>}
      </div>
    )
  }

  return (
    <div className="card-hover-effect group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105',
              accentIconBg[colorAccent],
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="font-display text-3xl font-bold text-ink tracking-tight">{value}</p>

        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>

      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  )
}