import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type NavItemProps = {
  /** Rute URL tujuan navigasi */
  to: string
  /** Elemen icon item menu */
  icon: ReactNode
  /** Label teks menu */
  label: string
  /** Cocokkan rute secara persis (exact match) */
  end?: boolean
  /** Callback saat link diklik (misal untuk menutup drawer mobile) */
  onClick?: () => void
}

/**
 * Komponen item link navigasi sidebar.
 * Menampilkan icon, teks label, serta highlight aktif dengan animasi halus.
 * 
 * @param props - Properti NavItem (to, icon, label, end, onClick)
 */
export function NavItem({ to, icon, label, end = false, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-white/20 text-white shadow-xs backdrop-blur-xs font-semibold'
            : 'text-white/75 hover:bg-white/10 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Indikator aktif di sisi kiri */}
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-sm" />
          )}

          <span
            className={cn(
              'shrink-0 transition-transform duration-200 group-hover:scale-110',
              isActive ? 'text-white' : 'text-white/70 group-hover:text-white',
            )}
          >
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}