import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'

export default function PanelPlaceholderPage({ title }: { title: string }) {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: title },
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
        Halaman {title} segera hadir.
      </div>
    </div>
  )
}