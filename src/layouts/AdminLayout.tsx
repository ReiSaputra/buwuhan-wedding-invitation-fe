import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ShieldCheck, Menu, X, LogOut, Clock, Sparkles } from 'lucide-react'
import { adminNav, adminNavFooter } from '@/config/navigation'
import { NavItem } from '@/components/dashboard/NavItem'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useClock } from '@/hooks/useClock'
import { useAuth } from '@/hooks/useAuth'

/**
 * Layout Khusus Panel Superadmin Buwuhan (AdminLayout).
 * Memiliki aksen visual khusus (Dark Slate & Deep Indigo dengan badge Admin),
 * serta navigasi modul admin (Overview, Pengguna, Undangan, Template).
 */
export default function AdminLayout() {
  const user = useCurrentUser()
  const clock = useClock()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/70">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-70 shrink-0 flex-col bg-slate-900 text-white shadow-2xl border-r border-slate-800">
        {/* Brand Header Admin */}
        <div className="p-5 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-bold tracking-tight text-white">
                  Buwuhan
                </span>
                <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Superadmin Workspace</p>
            </div>
          </div>
        </div>

        {/* Menu Navigasi Admin */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Manajemen
          </p>
          {adminNav.map((entry) => {
            if (entry.type === 'item') {
              return (
                <NavItem
                  key={entry.to}
                  to={entry.to}
                  icon={entry.icon}
                  label={entry.label}
                  end={entry.end}
                />
              )
            }
            return null
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Akses Cepat
          </p>
          {adminNavFooter.map((entry) => {
            if (entry.type === 'item') {
              return (
                <NavItem
                  key={entry.to}
                  to={entry.to}
                  icon={entry.icon}
                  label={entry.label}
                />
              )
            }
            return null
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
            >
              <LogOut size={16} />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Drawer Sidebar Mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full w-70 flex-col bg-slate-900 text-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={22} className="text-indigo-400" />
                <span className="font-display font-bold text-white">Buwuhan Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {adminNav.map((entry) => {
                if (entry.type === 'item') {
                  return (
                    <NavItem
                      key={entry.to}
                      to={entry.to}
                      icon={entry.icon}
                      label={entry.label}
                      end={entry.end}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    />
                  )
                }
                return null
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              {adminNavFooter.map((entry) => {
                if (entry.type === 'item') {
                  return (
                    <NavItem
                      key={entry.to}
                      to={entry.to}
                      icon={entry.icon}
                      label={entry.label}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    />
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      )}

      {/* Konten Utama Area Admin */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Garis Aksen Gradasi Superadmin (Deep Indigo to Purple) */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shrink-0" />

        {/* Topbar Admin */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 bg-white/80 backdrop-blur-md shadow-2xs border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Buka navigasi"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 lg:hidden cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-bold text-primary border border-indigo-100">
                <Sparkles size={13} />
                Portal Kontrol Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Jam WIB */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100/80 px-3 py-1.5 rounded-xl">
              <Clock size={13} className="text-slate-400" />
              <span>{clock} WIB</span>
            </div>

            {/* Profil Admin */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <p className="text-xs font-bold text-ink truncate max-w-32">{user.fullName}</p>
                <p className="text-[10px] font-bold text-primary uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Area Scrollable Konten Halaman Admin */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12 pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
