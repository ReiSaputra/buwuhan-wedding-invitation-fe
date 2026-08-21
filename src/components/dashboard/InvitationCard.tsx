import { SlidersHorizontal, XCircle, QrCode, Image as ImageIcon } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { Button } from '@/components/ui/Button'
import type { InvitationSummary, ViewMode } from '@/types/dashboard'
import { cn } from '@/lib/cn'

dayjs.locale('id')

type Props = {
  invitation: InvitationSummary
  view: ViewMode
  onManage: (id: string) => void
  onDelete: (id: string) => void
  onScan: (id: string) => void
}

export function InvitationCard({ invitation, view, onManage, onDelete, onScan }: Props) {
  const { coupleName, eventDate, eventTime, thumbnailUrl, slug } = invitation
  const dateLabel = dayjs(eventDate).format('D MMMM YYYY')

  const thumb = (
    <div
      className={cn(
        'shrink-0 overflow-hidden rounded-xl bg-surface',
        view === 'list' ? 'h-28 w-32' : 'h-40 w-full',
      )}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
          <ImageIcon size={20} />
          <span className="text-[10px]">Tanpa foto</span>
        </div>
      )}
    </div>
  )

  const info = (
    <div className="min-w-0 flex-1">
      <h3 className="font-display text-lg font-semibold text-ink">{coupleName}</h3>
      <p className="mt-0.5 text-sm text-muted">
        {eventTime} &nbsp;&bull;&nbsp; {dateLabel}
      </p>
      <a
        href={`/undangan/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
      >
        Lihat Web
      </a>
    </div>
  )

  const actions = (
    <div className={cn('flex items-center gap-2', view === 'grid' && 'mt-4 flex-wrap')}>
      <Button size="sm" variant="outline" icon={<SlidersHorizontal size={14} />} onClick={() => onManage(invitation.id)}>
        Kelola
      </Button>
      <Button size="sm" variant="outline" icon={<XCircle size={14} />} onClick={() => onDelete(invitation.id)}>
        Hapus
      </Button>
      <Button size="sm" variant="primary" icon={<QrCode size={14} />} onClick={() => onScan(invitation.id)}>
        Scan QR
      </Button>
    </div>
  )

  if (view === 'grid') {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
        {thumb}
        <div className="mt-4">{info}</div>
        {actions}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      {thumb}
      {info}
      {actions}
    </div>
  )
}