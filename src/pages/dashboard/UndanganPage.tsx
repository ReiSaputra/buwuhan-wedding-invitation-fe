import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { InvitationList } from '@/components/dashboard/InvitationList'
import { useInvitations } from '@/hooks/useInvitations'

/**
 * Halaman Manajemen Undangan Dashboard.
 * Menyediakan katalog lengkap undangan pernikahan digital, pencarian,
 * filter status, pembuatan undangan baru, serta akses cepat ke masing-masing panel.
 */
export default function UndanganPage() {
  const { invitations } = useInvitations()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Undangan' }]} />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Kelola Undangan Pernikahan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Atur detail acara, kelola data tamu undangan, pantau RSVP, dan ubah tema tampilan sesuai keinginan.
          </p>
        </div>
      </div>

      {/* Daftar Komponen Undangan */}
      <InvitationList
        title="Daftar Seluruh Undangan"
        invitations={invitations}
        showCreateButton={true}
      />
    </div>
  )
}