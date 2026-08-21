import { Gem } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PlanCode } from '@/types/dashboard'
import { cn } from '@/lib/cn'

const planStyle: Record<PlanCode, string> = {
  FREE: 'text-ink border-border bg-white',
  PRO: 'text-white border-transparent bg-primary',
  MAX: 'text-white border-transparent bg-primary-dark',
}

export function PlanBadge({ plan }: { plan: PlanCode }) {
  return (
    <Link
      to="/dashboard/langganan"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:opacity-90',
        planStyle[plan],
      )}
    >
      <Gem size={14} />
      {plan}
    </Link>
  )
}