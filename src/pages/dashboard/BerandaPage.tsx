import { Mail, Users, QrCode } from 'lucide-react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { InvitationList } from '@/components/dashboard/InvitationList'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useInvitations } from '@/hooks/useInvitations'
import { formatNumber } from '@/lib/format'

export default function BerandaPage() {
  const user = useCurrentUser()
  const { invitations, stats } = useInvitations()

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Beranda' }]} />

      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Halo, {user.nickname}!
        </h1>
        <p className="mt-1 text-sm text-muted">Senang bertemu dengan anda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Undangan" value={stats.totalInvitations} icon={<Mail size={18} />} />
        <StatCard label="Total Tamu" value={formatNumber(stats.totalGuests)} icon={<Users size={18} />} />
        <StatCard label="Sudah Check-in" value={formatNumber(stats.totalCheckedIn)} icon={<QrCode size={18} />} />
      </div>

      <InvitationList title="Panel Website" invitations={invitations} />
    </div>
  )
}