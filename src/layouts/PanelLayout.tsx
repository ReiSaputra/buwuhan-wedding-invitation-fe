import { useEffect, useState } from 'react'
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { instantAuthStorage } from '@/lib/instantAuthStorage'
import { buildPanelNav, panelNavFooter } from '@/config/navigation'

/**
 * Layout khusus untuk panel manajemen per-undangan digital.
 * Menyediakan navigasi kontekstual (Edit, Tamu, Kehadiran, Hadiah, Buwuh, Scan QR),
 * drawer mobile responsif, serta topbar aplikasi.
 */
export default function PanelLayout() {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { invitation } = useInvitationDetail(id)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isInstantAccess = instantAuthStorage.isInstantAccess()

  // Proteksi navigasi petugas instan: kunci hanya pada halaman catatan buwuh
  useEffect(() => {
    if (isInstantAccess && id) {
      const allowedPath = `/dashboard/undangan/${id}/catatan-buwuh`
      if (location.pathname !== allowedPath) {
        navigate(allowedPath, { replace: true })
      }
    }
  }, [isInstantAccess, id, location.pathname, navigate])

  const navItems = buildPanelNav(id, isInstantAccess)
  const navFooter = isInstantAccess ? [] : panelNavFooter

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          subtitle={invitation?.panelName ?? (isInstantAccess ? 'Petugas Buwuh' : user.nickname)}
          items={navItems}
          footer={navFooter}
        />
      </div>

      {/* Drawer Sidebar Mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              subtitle={invitation?.panelName ?? (isInstantAccess ? 'Petugas Buwuh' : user.nickname)}
              items={navItems}
              footer={navFooter}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Konten Utama Panel */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="h-1 w-full bg-indigo-600 shrink-0" />
        <Topbar user={user} onMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12 pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}