import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'plain' | 'filled'

type Props = {
  label: string
  value: number | string
  icon?: ReactNode
  hint?: string
  variant?: Variant
}

export function StatCard({ label, value, icon, hint, variant = 'plain' }: Props) {
  const isFilled = variant === 'filled'

  return (
    <div
      className={cn(
        'rounded-xl p-5',
        isFilled ? 'bg-primary text-white' : 'border border-border bg-card',
      )}
    >
      {isFilled ? (
        <>
          <p className="font-display text-3xl font-bold">{value}</p>
          <p className="mt-6 text-sm text-white/80">{label}</p>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted">{label}</p>
            {icon && <span className="text-primary">{icon}</span>}
          </div>
          <p className="mt-4 font-display text-3xl font-semibold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </>
      )}
    </div>
  )
}