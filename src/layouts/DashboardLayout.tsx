import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { dashboardNav, dashboardNavFooter } from '@/config/navigation'

export default function DashboardLayout() {
  const user = useCurrentUser()

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar items={dashboardNav} footer={dashboardNavFooter} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-1 w-full bg-success" />
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto px-8 pb-10 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}