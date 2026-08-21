import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { dashboardNav, dashboardNavFooter } from '@/config/navigation'

/**
 * Layout utama dashboard aplikasi Buwuhan.
 * Menyediakan sidebar desktop, drawer mobile responsif, topbar dengan jam dan profil,
 * serta area konten dinamis `<Outlet />`.
 */
export default function DashboardLayout() {
  const user = useCurrentUser()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar Desktop (Layar Lebar) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar items={dashboardNav} footer={dashboardNavFooter} />
      </div>

      {/* Drawer Sidebar Mobile (Layar Kecil) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar Panel Mobile */}
          <div className="relative z-10 flex h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              items={dashboardNav}
              footer={dashboardNavFooter}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Konten Utama Aplikasi */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Aksen Gradasi Garis Atas */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shrink-0" />
        
        {/* Topbar Navigasi */}
        <Topbar user={user} onMenuToggle={() => setIsMobileSidebarOpen(true)} />

        {/* Area Scrollable Konten Halaman */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12 pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}