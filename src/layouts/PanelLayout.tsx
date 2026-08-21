import { Outlet, useParams } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { buildPanelNav, panelNavFooter } from '@/config/navigation'

export default function PanelLayout() {
  const { id = '' } = useParams()
  const user = useCurrentUser()
  const { invitation } = useInvitationDetail(id)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        subtitle={invitation?.panelName ?? user.nickname}
        items={buildPanelNav(id)}
        footer={panelNavFooter}
      />
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