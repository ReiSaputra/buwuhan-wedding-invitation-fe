import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'

export type BadgeProps = {
  /** Varian warna badge */
  variant?: BadgeVariant
  /** Icon opsional di sebelah kiri teks badge */
  icon?: ReactNode
  /** Konten label teks badge */
  children: ReactNode
  /** Class styling kustom */
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-indigo-50 text-primary border-indigo-200/60 font-semibold',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  outline: 'bg-transparent text-slate-600 border-slate-200',
}

/**
 * Komponen label status / badge ringkas.
 * 
 * @param props - Properti Badge (variant, icon, children, className)
 */
export function Badge({ variant = 'default', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors',
        variantStyles[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
