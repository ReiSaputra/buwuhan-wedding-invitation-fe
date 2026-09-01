import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { NavGroupDef } from '@/config/navigation'
import { cn } from '@/lib/cn'

export type NavGroupProps = {
  /** Definisi grup menu navigasi beserta daftar anak menunya */
  group: NavGroupDef
  /** Callback saat salah satu item anak diklik */
  onItemClick?: () => void
}

/**
 * Komponen grup navigasi dropdown/accordion pada sidebar.
 * Otomatis terbuka jika salah satu rute anak sedang aktif.
 * 
 * @param props - Properti NavGroup (group, onItemClick)
 */
export function NavGroup({ group, onItemClick }: NavGroupProps) {
  const { pathname } = useLocation()
  const hasActiveChild = group.children.some((c) => pathname === c.to)
  // Null berarti "ikuti rute aktif". Begitu pengguna menekan tombol, nilainya
  // menjadi true/false dan pilihan manual itu yang menang.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null)

  // Status akhir diturunkan langsung saat render, sehingga tidak perlu effect
  // yang memanggil setState (penyebab cascading render).
  const isOpen = manualOpen ?? hasActiveChild

  /**
   * Menangani toggle buka/tutup grup menu.
   */
  function handleToggle() {
    setManualOpen(!isOpen)
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
          hasActiveChild
            ? 'text-white font-semibold'
            : 'text-white/75 hover:bg-white/10 hover:text-white',
        )}
      >
        <span className="shrink-0 text-white/70 transition-transform group-hover:scale-110">
          {group.icon}
        </span>
        <span className="flex-1 text-left truncate">{group.label}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-white/60 transition-transform duration-200', isOpen && 'rotate-180 text-white')}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-7 pr-1 pt-0.5 animate-in slide-in-from-top-2 duration-150">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 relative',
                  isActive
                    ? 'bg-white/20 text-white font-semibold shadow-2xs'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      isActive ? 'bg-white' : 'bg-white/30',
                    )}
                  />
                  <span>{child.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}