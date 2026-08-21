import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

/**
 * Pilihan varian gaya visual tombol.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'soft' | 'ghost' | 'danger'

/**
 * Pilihan ukuran tombol.
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Varian warna dan tema tombol */
  variant?: ButtonVariant
  /** Ukuran tombol */
  size?: ButtonSize
  /** Elemen ikon yang ditampilkan di samping teks tombol */
  icon?: ReactNode
  /** Menampilkan indikator loading berputar */
  isLoading?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-dark border border-transparent hover:shadow-indigo-500/25',
  secondary: 'bg-secondary text-white shadow-sm hover:bg-purple-700 active:bg-purple-800 border border-transparent',
  outline: 'bg-white text-ink border border-border hover:bg-surface hover:border-slate-300 shadow-xs',
  soft: 'bg-indigo-50 text-primary border border-transparent hover:bg-indigo-100/80',
  ghost: 'bg-transparent text-muted hover:text-ink border border-transparent hover:bg-surface',
  danger: 'bg-white text-danger border border-red-200 hover:bg-danger-light shadow-xs',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 gap-2 rounded-xl',
  lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl font-semibold',
}

/**
 * Komponen tombol universal antarmuka Buwuh Panel.
 * Mendukung varian tema, ukuran, icon, loading state, dan interaksi responsif.
 * 
 * @param props - Properti tombol standar HTML ditambah varian, icon, dan loading
 */
export function Button({
  variant = 'outline',
  size = 'md',
  icon,
  isLoading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
}