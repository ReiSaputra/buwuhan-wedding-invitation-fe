import { useState } from 'react'
import {
  SlidersHorizontal,
  Trash2,
  QrCode,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
} from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { InvitationSummary, ViewMode, InvitationStatus } from '@/types/dashboard'
import { getDaysRemaining } from '@/lib/format'
import { cn } from '@/lib/cn'

dayjs.locale('id')

export type InvitationCardProps = {
  /** Objek ringkasan data undangan */
  invitation: InvitationSummary
  /** Mode tampilan kartu ('grid' atau 'list') */
  view: ViewMode
  /** Callback saat tombol 'Kelola' diklik */
  onManage: (id: string) => void
  /** Callback saat tombol 'Hapus' diklik */
  onDelete: (id: string) => void
  /** Callback saat tombol 'Scan QR' diklik */
  onScan: (id: string) => void
}

const statusBadgeConfig: Record<
  InvitationStatus,
  { label: string; variant: 'success' | 'warning' | 'default' }
> = {
  ACTIVE: { label: 'Aktif', variant: 'success' },
  DRAFT: { label: 'Draft', variant: 'warning' },
  COMPLETED: { label: 'Selesai', variant: 'default' },
}

/**
 * Komponen kartu item undangan digital.
 * Menampilkan thumbnail foto, nama pengantin, tanggal acara, progress check-in tamu,
 * status publikasi, dan aksi kelola panel.
 * 
 * @param props - Properti InvitationCard (invitation, view, onManage, onDelete, onScan)
 */
export function InvitationCard({
  invitation,
  view,
  onManage,
  onDelete,
  onScan,
}: InvitationCardProps) {
  const [copied, setCopied] = useState(false)
  const {
    id,
    coupleName,
    eventDate,
    eventTime,
    thumbnailUrl,
    slug,
    status = 'DRAFT',
    guestCount = 0,
    checkedInCount = 0,
  } = invitation

  const dateLabel = eventDate ? dayjs(eventDate).format('D MMMM YYYY') : 'Tanggal belum diatur'
  const daysLeft = getDaysRemaining(eventDate)
  const checkInPercent = guestCount > 0 ? Math.round((checkedInCount / guestCount) * 100) : 0
  const statusInfo = statusBadgeConfig[status] ?? statusBadgeConfig.DRAFT
  const publicUrl = `${window.location.origin}/undangan/${slug}`

  /**
   * Menyalin tautan publik undangan ke clipboard pengguna.
   */
  async function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Komponen Thumbnail Gambar
  const thumb = (
    <div
      className={cn(
        'group/thumb relative shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80',
        view === 'list' ? 'h-28 w-36 sm:h-32 sm:w-44' : 'h-44 w-full',
      )}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={coupleName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted">
          <ImageIcon size={24} className="text-slate-400" />
          <span className="text-[11px] font-medium">Tanpa foto sampul</span>
        </div>
      )}

      {/* Floating Status Badge on Thumbnail */}
      <div className="absolute left-2.5 top-2.5">
        <Badge variant={statusInfo.variant} className="shadow-xs backdrop-blur-xs bg-white/90">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
                status === 'ACTIVE'
                ? 'bg-emerald-500'
                : status === 'DRAFT'
                ? 'bg-amber-500'
                : 'bg-slate-400',
            )}
          />
          {statusInfo.label}
        </Badge>
      </div>
    </div>
  )

  // Komponen Info Teks
  const info = (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink hover:text-primary transition">
          {coupleName}
        </h3>

        {daysLeft > 0 ? (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {daysLeft} hari lagi
          </span>
        ) : daysLeft === 0 ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            Hari ini!
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Calendar size={13} className="text-slate-400" />
          {dateLabel}
        </span>
        {eventTime && (
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            {eventTime.includes('WIB') ? eventTime : `${eventTime} WIB`}
          </span>
        )}
      </div>

      {/* Mini Progress Tamu */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-muted">
            <Users size={12} className="text-slate-400" />
            Check-in: <strong className="text-ink font-semibold">{checkedInCount}</strong> / {guestCount} Tamu
          </span>
          <span className="font-semibold text-primary">{checkInPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(checkInPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )

  // Komponen Tombol Aksi
  const actions = (
    <div className={cn('flex items-center gap-2', view === 'grid' ? 'mt-4 flex-wrap pt-3 border-t border-slate-100' : 'shrink-0')}>
      <Button
        size="sm"
        variant="outline"
        icon={copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
        onClick={handleCopyLink}
        title="Salin Link Undangan"
      >
        {copied ? 'Tersalin' : 'Salin'}
      </Button>

      <a
        href={`/undangan/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        title="Buka Halaman Web Undangan"
      >
        <ExternalLink size={13} />
        <span>Web</span>
      </a>

      <Button
        size="sm"
        variant="outline"
        icon={<SlidersHorizontal size={13} />}
        onClick={() => onManage(id)}
      >
        Kelola
      </Button>

      <Button
        size="sm"
        variant="primary"
        icon={<QrCode size={13} />}
        onClick={() => onScan(id)}
      >
        Scan QR
      </Button>

      <Button
        size="sm"
        variant="danger"
        icon={<Trash2 size={13} />}
        onClick={() => onDelete(id)}
        title="Hapus Undangan"
      />
    </div>
  )

  if (view === 'grid') {
    return (
      <div className="card-hover-effect rounded-2xl border border-border bg-card p-4 shadow-xs">
        {thumb}
        <div className="mt-4">{info}</div>
        {actions}
      </div>
    )
  }

  return (
    <div className="card-hover-effect flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {thumb}
      {info}
      {actions}
    </div>
  )
}