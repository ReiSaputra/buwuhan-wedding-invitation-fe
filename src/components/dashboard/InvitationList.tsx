import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { ViewToggle } from './ViewToggle'
import { InvitationCard } from './InvitationCard'
import type { InvitationSummary, ViewMode } from '@/types/dashboard'

type Props = {
  title: string
  invitations: InvitationSummary[]
  defaultView?: ViewMode
  emptyMessage?: string
}

export function InvitationList({
  title,
  invitations,
  defaultView = 'list',
  emptyMessage = 'Belum ada undangan. Buat undangan pertamamu.',
}: Props) {
  const [view, setView] = useState<ViewMode>(defaultView)
  const navigate = useNavigate()

  function handleDelete(id: string) {
    // TODO: ganti dengan modal konfirmasi + useMutation DELETE /invitations/:id
    const ok = window.confirm('Hapus undangan ini? Tindakan ini tidak bisa dibatalkan.')
    if (ok) console.log('hapus', id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Mail size={28} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
          {invitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              view={view}
              onManage={(id) => navigate(`/dashboard/undangan/${id}`)}
              onDelete={handleDelete}
              onScan={(id) => navigate(`/dashboard/undangan/${id}/scan-qr`)}
            />
          ))}
        </div>
      )}
    </section>
  )
}