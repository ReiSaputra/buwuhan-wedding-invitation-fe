import { Gem, Crown, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PlanCode } from '@/types/dashboard'
import { cn } from '@/lib/cn'

export type PlanBadgeProps = {
  /** Kode paket langganan user aktif */
  plan: PlanCode
  /** Class tambahan jika diperlukan */
  className?: string
}

const planStyle: Record<PlanCode, string> = {
  FREE: 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 shadow-2xs',
  PRO: 'bg-indigo-600 text-white border-transparent shadow-xs shadow-indigo-500/20 hover:bg-indigo-700',
  MAX: 'bg-purple-700 text-white border-transparent shadow-xs shadow-purple-600/25 hover:bg-purple-800',
}

const planIcons: Record<PlanCode, typeof Gem> = {
  FREE: Gem,
  PRO: Sparkles,
  MAX: Crown,
}

/**
 * Komponen lencana (badge) paket langganan pada topbar atau profil.
 * Mengarahkan user ke halaman pemilihan paket saat diklik.
 * 
 * @param props - Properti PlanBadge (plan, className)
 */
export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const Icon = planIcons[plan] || Gem

  return (
    <Link
      to="/dashboard/langganan"
      title="Kelola Paket Langganan"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-95',
        planStyle[plan],
        className,
      )}
    >
      <Icon size={14} className={cn(plan === 'MAX' ? 'text-amber-300' : 'text-current')} />
      <span>{plan}</span>
    </Link>
  )
}