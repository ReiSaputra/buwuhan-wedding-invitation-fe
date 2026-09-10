import { useState } from 'react'
import {
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Phone,
  QrCode,
  ServerCrash,
  Tag,
  UsersRound,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useGuestDetail } from '@/hooks/useGuestDetail'
import { useGuestActions } from '@/hooks/useGuestActions'
import { formatDateId, formatTimeWib } from '@/lib/format'

export type GuestDetailModalProps = {
  invitationId: string
  /** ID tamu yang dilihat. Komponen hanya dirender saat ID ada. */
  guestId: string
  onClose: () => void
}

/** Menampilkan tanggal + jam, atau tanda hubung bila kosong. */
function formatMoment(iso: string | null): string {
  if (!iso) return '—'
  return `${formatDateId(iso)}, ${formatTimeWib(iso)}`
}

/**
 * Modal detail satu tamu. Datanya diambil langsung lewat
 * GET /invitations/:invitationId/guests/:id sehingga menampilkan field yang
 * tidak muat di tabel: token QR, pax rencana vs aktual, jam check-in/out,
 * email, dan tautan undangan personal.
 */
export function GuestDetailModal({
  invitationId,
  guestId,
  onClose,
}: GuestDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null)
  const { guest, isLoading, isError } = useGuestDetail(
    invitationId,
    guestId,
  )
  const { sendEmail, isSendingEmail } = useGuestActions(invitationId)

  async function handleSendEmail() {
    if (!guest) return
    setEmailSentStatus(null)
    try {
      await sendEmail(guest.id)
      setEmailSentStatus(`Email undangan berhasil dikirim ke ${guest.email}`)
      setTimeout(() => setEmailSentStatus(null), 5000)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal mengirim email undangan.')
    }
  }

  async function handleCopy(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 1500)
    } catch {
      setCopiedField(null)
    }
  }

  const rowClass =
    'flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0'
  const labelClass = 'flex items-center gap-1.5 text-[11px] font-medium text-slate-500'
  const valueClass = 'text-right text-xs font-semibold text-ink'

  return (
    <Modal isOpen onClose={onClose} title="Detail Data Tamu" maxWidth="lg">
      <>
        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="space-y-3 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
              <p className="text-xs font-medium text-slate-400">Memuat detail tamu…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="max-w-xs space-y-2 text-center">
              <ServerCrash size={24} className="mx-auto text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">
                Data tamu tidak ditemukan
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Tamu ini mungkin sudah dihapus. Muat ulang halaman untuk menyegarkan daftar.
              </p>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-1">
                Tutup
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && guest && (
          <div className="space-y-4">
            {/* Identitas */}
            <div className="space-y-2">
              <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                {guest.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={guest.isAttended ? 'success' : 'default'}>
                  {guest.isAttended ? 'Sudah Check-In' : 'Belum Hadir'}
                </Badge>
                <Badge variant="outline" icon={<Tag size={11} />}>
                  {guest.category ?? 'Tanpa Kategori'}
                </Badge>
              </div>
            </div>

            {/* Rincian */}
            <div className="rounded-2xl border border-border bg-white px-4 py-1">
              <div className={rowClass}>
                <span className={labelClass}>
                  <Phone size={12} /> Nomor HP
                </span>
                <span className={valueClass}>{guest.phone ?? '—'}</span>
              </div>

              <div className={rowClass}>
                <span className={labelClass}>
                  <Mail size={12} /> Email
                </span>
                <span className={valueClass}>{guest.email ?? '—'}</span>
              </div>

              <div className={rowClass}>
                <span className={labelClass}>
                  <UsersRound size={12} /> Jumlah Tamu (rencana / aktual)
                </span>
                <span className={valueClass}>
                  {guest.paxCount} / {guest.paxActual ?? '—'}
                </span>
              </div>

              <div className={rowClass}>
                <span className={labelClass}>
                  <LogIn size={12} /> Check-In
                </span>
                <span className={valueClass}>{formatMoment(guest.checkedInAt)}</span>
              </div>

              <div className={rowClass}>
                <span className={labelClass}>
                  <LogOut size={12} /> Check-Out
                </span>
                <span className={valueClass}>{formatMoment(guest.checkedOutAt)}</span>
              </div>

              <div className={rowClass}>
                <span className={labelClass}>
                  <CalendarClock size={12} /> Terdaftar
                </span>
                <span className={valueClass}>{formatMoment(guest.createdAt)}</span>
              </div>
            </div>

            {/* Catatan */}
            {guest.notes && (
              <blockquote className="rounded-2xl border-l-4 border-primary bg-indigo-50/50 p-3.5 font-serif text-xs italic leading-relaxed text-slate-700">
                "{guest.notes}"
              </blockquote>
            )}

            {/* Token QR */}
            <div className="rounded-2xl border border-border bg-slate-50/60 p-3.5">
              <p className={labelClass}>
                <QrCode size={12} /> Token QR Tamu
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] text-slate-700">
                  {guest.qrCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy('qr', guest.qrCode)}
                  className="inline-flex items-center gap-1.5"
                >
                  {copiedField === 'qr' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedField === 'qr' ? 'Tersalin' : 'Salin'}
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
                Token ini yang dibaca halaman Scan QR saat tamu tiba di lokasi.
              </p>
            </div>

            {/* Feedback Pengiriman Email */}
            {emailSentStatus && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] font-medium text-emerald-700 animate-in fade-in">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{emailSentStatus}</span>
              </div>
            )}

            {/* Aksi */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              {guest.email && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSendingEmail}
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-1.5 text-primary border-primary/20 hover:bg-primary/5"
                >
                  {isSendingEmail ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  {isSendingEmail ? 'Mengirim...' : 'Kirim Email'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCopy('link', guest.invitationUrl)}
                className="inline-flex items-center gap-1.5"
              >
                {copiedField === 'link' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedField === 'link' ? 'Link Tersalin' : 'Salin Link Undangan'}
              </Button>

              <a
                href={guest.invitationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Undangan
              </a>
            </div>
          </div>
        )}
      </>
    </Modal>
  )
}