import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { PanelHeader } from '@/components/panel/PanelHeader'
import { ScanQrCta } from '@/components/panel/ScanQrCta'
import { ActivityLogList } from '@/components/panel/ActivityLogList'
import { QuickActionCard } from '@/components/panel/QuickActionCard'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { formatNumber, formatRupiah } from '@/lib/format'

export default function PanelBerandaPage() {
  const { id = '' } = useParams()
  const { invitation, activities } = useInvitationDetail(id)
  const base = `/dashboard/undangan/${id}`

  const quickActions = [
    { label: 'Buku Tamu', to: `${base}/buku-tamu` },
    { label: 'RSVP', to: `${base}/rsvp` },
    { label: 'Hadiah', to: `${base}/hadiah` },
    { label: 'Petugas', to: `${base}/petugas` },
    { label: 'Template', to: `${base}/template` },
    { label: 'Catatan Buwuh', to: `${base}/catatan-buwuh` },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.panelName}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Kolom kiri */}
        <div className="space-y-6">
          <PanelHeader
            coupleName={invitation.coupleName}
            eventDate={invitation.eventDate}
            slug={invitation.slug}
          />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Log Aktivitas</h2>
            <ActivityLogList logs={activities} />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Pilih cepat</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.to} label={action.label} to={action.to} />
              ))}
            </div>
          </section>
        </div>

        {/* Kolom kanan */}
        <aside className="space-y-4">
          <ScanQrCta to={`${base}/scan-qr`} />

          <h2 className="pt-2 text-sm font-semibold text-ink">Status</h2>
          <StatCard variant="filled" label="Jumlah tamu" value={formatNumber(invitation.guestCount)} />
          <StatCard variant="filled" label="Konfirmasi tamu hadir" value={formatNumber(invitation.confirmedCount)} />
          <StatCard variant="filled" label="Bantuan buwuh" value={formatRupiah(invitation.buwuhTotal)} />
        </aside>
      </div>
    </div>
  )
}