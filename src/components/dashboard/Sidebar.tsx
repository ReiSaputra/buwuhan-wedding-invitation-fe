import { Gem, X, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NavItem } from './NavItem'
import { NavGroup } from './NavGroup'
import type { NavEntry } from '@/config/navigation'
import type { CurrentUser } from '@/types/dashboard'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export type SidebarProps = {
  /** Subtitle atau nama konteks panel aktif (misal nama undangan) */
  subtitle?: string
  /** Daftar menu navigasi utama */
  items: NavEntry[]
  /** Daftar menu navigasi bagian footer (misal Pengaturan) */
  footer?: NavEntry[]
  /** Callback untuk menutup drawer sidebar pada tampilan mobile */
  onClose?: () => void
}

/**
 * Komponen Sidebar navigasi utama aplikasi Buwuh Panel.
 * Menampilkan logo brand, daftar menu navigasi bersarang/grup, dan widget akun user.
 * 
 * @param props - Properti Sidebar (subtitle, items, footer, onClose)
 */
export function Sidebar({ subtitle, items, footer, onClose }: SidebarProps) {
  const user: CurrentUser = useCurrentUser()

  /**
   * Merender entri navigasi (apakah item tunggal atau grup accordion).
   * 
   * @param entry - Objek definisi navigasi NavEntry
   */
  function renderEntry(entry: NavEntry) {
    if (entry.type === 'group') {
      return <NavGroup key={entry.label} group={entry} onItemClick={onClose} />
    }
    return (
      <NavItem
        key={entry.to}
        to={entry.to}
        icon={entry.icon}
        label={entry.label}
        end={entry.end}
        onClick={onClose}
      />
    )
  }

  return (
    <aside className="sidebar-gradient relative flex h-full w-68 shrink-0 flex-col px-4 py-5 text-white shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 pb-5">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white shadow-inner transition-transform duration-200 group-hover:scale-105">
            <Gem size={22} className="text-white drop-shadow-sm" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Buwuh Panel
            </span>
            <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase flex items-center gap-1">
              <Sparkles size={10} className="text-amber-300" /> Wedding SaaS
            </span>
          </div>
        </Link>

        {/* Tombol tutup khusus mobile */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Subtitle konteks panel jika ada */}
      {subtitle && (
        <div className="mx-2 mb-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/85 backdrop-blur-xs border border-white/10 flex items-center justify-between">
          <span className="truncate font-medium">Panel: {subtitle}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>
      )}

      <div className="mb-3 h-px bg-white/15" />

      {/* Menu Navigasi Utama */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {items.map(renderEntry)}
      </nav>

      {/* Footer Navigasi & Status Card */}
      <div className="mt-auto pt-3 space-y-3">
        {footer && footer.length > 0 && (
          <>
            <div className="h-px bg-white/15" />
            <nav className="space-y-1">{footer.map(renderEntry)}</nav>
          </>
        )}

        {/* User Mini Card */}
        <div className="rounded-xl bg-black/15 p-3 backdrop-blur-xs border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white uppercase">
              {user.nickname ? user.nickname.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
              <p className="text-[10px] text-white/70 truncate">{user.role}</p>
            </div>
          </div>
          <Link
            to="/dashboard/langganan"
            onClick={onClose}
            className="shrink-0 rounded-md bg-white/20 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/30 transition uppercase"
          >
            {user.plan}
          </Link>
        </div>
      </div>
    </aside>
  )
}