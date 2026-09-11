import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, User, Settings, CreditCard, LogOut, CheckCheck, Clock, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useClock } from '@/hooks/useClock'
import { useAuth } from '@/hooks/useAuth'
import { PlanBadge } from './PlanBadge'
import { instantAuthStorage } from '@/lib/instantAuthStorage'
import type { CurrentUser, UserNotification } from '@/types/dashboard'
import { cn } from '@/lib/cn'

export type TopbarProps = {
  /** Objek data user yang sedang login */
  user: CurrentUser
  /** Callback untuk membuka drawer sidebar di perangkat mobile */
  onMenuToggle?: () => void
}

const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'n1',
    title: 'Konfirmasi Kehadiran Tamu',
    message: 'Siti Rahmawan mengonfirmasi hadir (2 pax) pada undangan Janpiter & Yudi.',
    createdAt: '5 menit lalu',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Catatan Buwuh Baru',
    message: 'Budi Santoso mencatat amplop sebesar Rp 500.000 via petugas meja.',
    createdAt: '1 jam lalu',
    read: false,
    type: 'info',
  },
  {
    id: 'n3',
    title: 'Batas Kuota Tamu',
    message: 'Kapasitas paket FREE Anda tersisa 5 tamu lagi. Pertimbangkan upgrade.',
    createdAt: '1 hari lalu',
    read: true,
    type: 'warning',
  },
]

/**
 * Komponen Header / Topbar Dashboard.
 * Menyediakan tampilan jam real-time dinamis, toggle drawer mobile, pusat notifikasi,
 * serta menu dropdown akun pengguna (Profil, Pengaturan, Tagihan, Keluar).
 */
export function Topbar({ user, onMenuToggle }: TopbarProps) {
  const clock = useClock()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>(INITIAL_NOTIFICATIONS)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isInstantAccess = instantAuthStorage.isInstantAccess()

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Tutup dropdown jika user klik di luar elemen
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Menandai semua notifikasi sebagai telah dibaca.
   */
  function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="glass-panel sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 shadow-2xs border-b border-border/80">
      {/* Sisi Kiri: Tombol Menu Mobile & Jam Real-Time */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Buka menu navigasi"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-ink lg:hidden cursor-pointer active:scale-95"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/70 border border-slate-200/60 rounded-xl px-3 py-1.5">
          <Clock size={13} className="text-primary" />
          <span>{clock}</span>
        </div>
      </div>

      {/* Sisi Kanan: Notifikasi, Paket Langganan, Profil */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Popover Notifikasi (hanya untuk akun terdaftar) */}
        {!isInstantAccess && (
          <div ref={notifRef} className="relative">
            <button
              type="button"
              aria-label="Daftar Notifikasi"
              onClick={() => {
                setIsNotifOpen((v) => !v)
                setIsProfileOpen(false)
              }}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-600 shadow-2xs transition-all cursor-pointer active:scale-95',
                isNotifOpen ? 'border-primary text-primary bg-indigo-50/50' : 'hover:bg-slate-50 hover:text-ink',
              )}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="glass-dropdown absolute right-0 top-12 z-50 w-80 sm:w-92 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-ink">Notifikasi</h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Tandai dibaca</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'rounded-xl p-2.5 transition-colors border',
                        n.read
                          ? 'bg-slate-50/70 border-slate-100 text-slate-500'
                          : 'bg-indigo-50/40 border-indigo-100 text-ink shadow-2xs',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-ink">{n.title}</p>
                        <span className="text-[10px] text-muted whitespace-nowrap">{n.createdAt}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lencana Paket Aktif */}
        {!isInstantAccess ? (
          <PlanBadge plan={user.plan} />
        ) : (
          <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 shadow-2xs">
            Sesi Petugas
          </span>
        )}

        {/* Dropdown Menu Profil User */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((v) => !v)
              setIsNotifOpen(false)
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border border-border bg-white p-1 sm:pl-3 sm:pr-2 shadow-2xs transition-all cursor-pointer active:scale-95',
              isProfileOpen ? 'border-primary ring-2 ring-indigo-500/20' : 'hover:bg-slate-50',
            )}
          >
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-bold text-ink truncate max-w-28">{user.fullName}</p>
              <p className="text-[10px] font-medium text-muted">{user.role}</p>
            </div>

            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
                {user.fullName.charAt(0)}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div className="glass-dropdown absolute right-0 top-12 z-50 w-56 rounded-2xl p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-ink truncate">{user.fullName}</p>
                <p className="text-[10px] text-muted truncate">
                  {isInstantAccess ? 'Petugas Lapangan (Magic Link)' : (user.email || 'admin@buwuhan.com')}
                </p>
              </div>

              {!isInstantAccess ? (
                <div className="py-1 space-y-0.5">
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary bg-indigo-50/70 hover:bg-indigo-100/80 transition"
                    >
                      <ShieldCheck size={14} className="text-primary" />
                      <span>Panel Superadmin</span>
                    </Link>
                  )}

                  <Link
                    to="/dashboard/pengaturan"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-ink transition"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Profil Saya</span>
                  </Link>

                  <Link
                    to="/dashboard/langganan"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-ink transition"
                  >
                    <CreditCard size={14} className="text-slate-400" />
                    <span>Paket & Tagihan</span>
                  </Link>

                  <Link
                    to="/dashboard/pengaturan"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-ink transition"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Pengaturan Akun</span>
                  </Link>
                </div>
              ) : null}

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    setIsProfileOpen(false)
                    await logout()
                    navigate('/login', { replace: true })
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-danger hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{isInstantAccess ? 'Keluar Sesi Petugas' : 'Keluar Akun'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}