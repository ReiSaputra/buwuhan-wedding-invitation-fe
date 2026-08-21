import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline' | 'soft' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark border border-transparent',
  outline: 'bg-white text-ink border border-border hover:bg-surface',
  soft: 'bg-surface text-ink border border-transparent hover:bg-border',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-surface',
  danger: 'bg-white text-danger border border-border hover:bg-red-50',
}

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
}

export function Button({
  variant = 'outline',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}