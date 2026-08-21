import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { PlanTier, PlanCode } from '@/types/dashboard'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/cn'

type Props = {
  plan: PlanTier
  isCurrent: boolean
  onSelect: (code: PlanCode) => void
}

export function PlanCard({ plan, isCurrent, onSelect }: Props) {
  const { code, name, price, description, features, ctaLabel, isPopular } = plan

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl bg-card p-6 transition',
        isPopular
          ? 'border-2 border-primary shadow-lg lg:-my-3 lg:py-9'
          : 'border border-border shadow-sm',
      )}
    >
      {isPopular && (
        <span className="absolute right-5 top-5 text-[10px] font-bold tracking-wider text-primary">
          MOST POPULAR
        </span>
      )}

      {/* Nama paket */}
      <p className={cn('text-sm font-semibold', isPopular ? 'text-primary' : 'text-ink')}>
        {name}
      </p>

      {/* Harga */}
      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-4xl font-bold text-ink">
          {price === 0 ? 'Gratis' : formatRupiah(price)}
        </span>
        {price > 0 && <span className="pb-1 text-sm text-muted">/bulan</span>}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>

      {/* Daftar fitur */}
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15">
              <Check size={11} className="text-success" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Tombol aksi */}
      <Button
        className="mt-8 w-full"
        variant={isCurrent ? 'outline' : isPopular ? 'primary' : 'soft'}
        disabled={isCurrent}
        onClick={() => onSelect(code)}
      >
        {isCurrent ? 'Paket Aktif' : ctaLabel}
      </Button>
    </div>
  )
}