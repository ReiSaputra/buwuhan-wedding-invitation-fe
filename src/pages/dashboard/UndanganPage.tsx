import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { InvitationList } from '@/components/dashboard/InvitationList'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useInvitations } from '@/hooks/useInvitations'

export default function UndanganPage() {
  const user = useCurrentUser()
  const { invitations } = useInvitations()

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Beranda' }]} />

      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Halo, {user.nickname}!
        </h1>
        <p className="mt-1 text-sm text-muted">Senang bertemu dengan anda.</p>
      </div>

      <InvitationList title="Panel Undangan" invitations={invitations} />
    </div>
  )
}