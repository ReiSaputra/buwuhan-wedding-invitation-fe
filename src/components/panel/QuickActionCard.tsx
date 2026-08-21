import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  label: string
  to: string
  value?: string
  icon?: ReactNode
}

export function QuickActionCard({ label, to, value, icon }: Props) {
  return (
    <Link
      to={to}
      className="flex min-h-[100px] flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      {value && <span className="font-display text-2xl font-semibold text-ink">{value}</span>}
    </Link>
  )
}