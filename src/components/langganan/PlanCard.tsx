import { Check, Sparkles, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { PlanTier, PlanCode } from '@/types/dashboard'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/cn'

export type PlanCardProps = {
  /** Objek data tingkatan paket langganan */
  plan: PlanTier
  /** Menandakan apakah paket ini adalah paket aktif pengguna saat ini */
  isCurrent: boolean
  /** Apakah user memilih penagihan tahunan (diskon 20%) */
  isYearly?: boolean
  /** Callback saat tombol pilih paket diklik */
  onSelect: (code: PlanCode) => void
}

/**
 * Komponen kartu paket langganan pricing.
 * Menampilkan nama paket, nominal harga, keunggulan fitur, dan tombol aksi pemesanan.
 * 
 * @param props - Properti PlanCard (plan, isCurrent, isYearly, onSelect)
 */
export function PlanCard({ plan, isCurrent, isYearly = false, onSelect }: PlanCardProps) {
  const { code, name, price, description, features, ctaLabel, isPopular } = plan

  // Hitung penyesuaian harga jika tahunan (diskon 20%)
  const effectivePrice = isYearly && price > 0 ? Math.round(price * 0.8) : price

  return (
    <div
      className={cn(
        'card-hover-effect relative flex flex-col rounded-3xl bg-card p-6 sm:p-8 transition-all duration-300',
        isPopular
          ? 'border-2 border-primary shadow-xl shadow-indigo-500/10 lg:-my-4 lg:py-10 ring-4 ring-indigo-500/10'
          : 'border border-border shadow-xs hover:border-slate-300',
      )}
    >
      {/* Most Popular Ribbon Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-[11px] font-bold tracking-wider text-white shadow-md flex items-center gap-1.5 uppercase">
          <Sparkles size={13} className="text-amber-300" />
            Paling Populer
        </div>
      )}

      {/* Header Nama Paket & Icon */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className={cn('text-base font-bold', isPopular ? 'text-primary' : 'text-ink')}>
            {name}
          </p>
          <p className="mt-1 text-xs text-muted leading-relaxed min-h-[36px]">{description}</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
            isPopular
              ? 'bg-indigo-50 text-primary border-indigo-200'
              : code === 'MAX'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-slate-50 text-slate-600 border-slate-200',
          )}
        >
          {isPopular ? <Zap size={18} /> : code === 'MAX' ? <Sparkles size={18} /> : <Shield size={18} />}
        </div>
      </div>

      {/* Tampilan Harga */}
      <div className="mt-5 pb-5 border-b border-slate-100">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {effectivePrice === 0 ? 'Gratis' : formatRupiah(effectivePrice)}
          </span>
          {price > 0 && <span className="text-xs text-muted font-medium">/bulan</span>}
        </div>
        {isYearly && price > 0 && (
          <p className="mt-1 text-[11px] font-medium text-emerald-600">
            Hemat 20% ditagih tahunan ({formatRupiah(effectivePrice * 12)}/thn)
          </p>
        )}
      </div>

      {/* Daftar Fitur Keunggulan */}
      <div className="mt-6 flex-1 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fitur Termasuk:</p>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-xs text-slate-700">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={11} strokeWidth={3} />
              </span>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tombol Aksi Pesan / Upgrade */}
      <div className="mt-8 pt-4">
        <Button
          className={cn(
            'w-full py-3 font-semibold shadow-xs',
            isCurrent ? 'opacity-80' : '',
          )}
          variant={isCurrent ? 'outline' : isPopular ? 'primary' : 'soft'}
          disabled={isCurrent}
          onClick={() => onSelect(code)}
        >
          {isCurrent ? 'Paket Aktif Saat Ini' : ctaLabel}
        </Button>
      </div>
    </div>
  )
}