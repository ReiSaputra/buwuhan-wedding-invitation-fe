import {
  CalendarClock,
  ExternalLink,
  Heart,
  ImageOff,
  Images,
  Loader2,
  MapPin,
  ServerCrash,
  Users,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAdminInvitationDetail } from '@/hooks/useAdmin'
import { formatDateId } from '@/lib/format'

export type AdminInvitationDetailModalProps = {
  invitationId: string
  onClose: () => void
}

/** Satu baris metadata bergaya label-nilai. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-xs font-medium text-slate-800">{value}</span>
    </div>
  )
}

/**
 * Modal pemeriksaan konten undangan untuk admin.
 * Data diambil dari GET /admin/invitations/:id yang mengembalikan seluruh isi
 * undangan (mempelai, galeri, kisah) — tidak tersedia pada endpoint daftar.
 */
export function AdminInvitationDetailModal({
  invitationId,
  onClose,
}: AdminInvitationDetailModalProps) {
  const { data: inv, isLoading, isError } = useAdminInvitationDetail(invitationId)

  return (
    <Modal isOpen onClose={onClose} title="Detail & Pemeriksaan Konten" maxWidth="2xl">
      <>
        {isLoading && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="space-y-3 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-800" />
              <p className="text-xs font-medium text-slate-400">Memuat detail undangan…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="max-w-xs space-y-2 text-center">
              <ServerCrash className="mx-auto h-6 w-6 text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">
                Undangan tidak dapat dibuka
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Undangan mungkin sudah dihapus pemiliknya, atau sesi admin Anda telah berakhir.
              </p>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-1">
                Tutup
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && inv && (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            {/* Kepala */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{inv.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={inv.status === 'ACTIVE' ? 'success' : 'default'}>
                  {inv.status}
                </Badge>
                <Badge variant="outline">{inv.eventCategory ?? 'WEDDING'}</Badge>
                <Badge variant="outline">{inv.owner.planTier}</Badge>
                <a
                  href={`/undangan/${inv.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  /{inv.slug}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Users className="h-3 w-3" /> Total Tamu
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {inv.stats.totalGuests}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CalendarClock className="h-3 w-3" /> Total RSVP
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {inv.stats.totalRsvps}
                </p>
              </div>
            </div>

            {/* Metadata acara & pemilik */}
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 py-1">
              <InfoRow label="Pemilik" value={`${inv.owner.fullName} · ${inv.owner.email}`} />
              <InfoRow
                label="Tanggal Acara"
                value={inv.eventDate ? formatDateId(inv.eventDate) : '—'}
              />
              <InfoRow label="Waktu" value={inv.eventTime || '—'} />
              <InfoRow label="Template" value={inv.template?.name || 'Kustom / belum dipilih'} />
              <InfoRow
                label="Dipublikasikan"
                value={inv.publishedAt ? formatDateId(inv.publishedAt) : 'Belum pernah'}
              />
            </div>

            {/* Lokasi */}
            {(inv.venue || inv.address) && (
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <MapPin className="h-3 w-3" /> Lokasi
                </p>
                <p className="mt-1 text-xs font-medium text-slate-800">{inv.venue || '—'}</p>
                {inv.address && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    {inv.address}
                  </p>
                )}
              </div>
            )}

            {/* Mempelai / tokoh acara */}
            {inv.couples.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Heart className="h-3 w-3" /> Mempelai ({inv.couples.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {inv.couples.map((couple) => (
                    <div
                      key={`${couple.type}-${couple.name}`}
                      className="rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {couple.type}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-900">{couple.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Putra/putri dari {couple.fatherName} &amp; {couple.motherName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Galeri — titik paling rawan pelanggaran konten */}
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Images className="h-3 w-3" /> Galeri Foto ({inv.galleryPhotos.length})
              </p>
              {inv.galleryPhotos.length === 0 ? (
                <p className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-[11px] text-slate-400">
                  <ImageOff className="h-3.5 w-3.5" /> Belum ada foto diunggah.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {inv.galleryPhotos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                      title={photo.caption ?? 'Buka ukuran penuh'}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption ?? 'Foto galeri undangan'}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Kisah */}
            {inv.loveStories.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Kisah ({inv.loveStories.length})
                </p>
                <div className="space-y-2">
                  {inv.loveStories.map((story) => (
                    <div key={story.id} className="rounded-xl border border-slate-200 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {story.yearOrDate}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-900">{story.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                        {story.story}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </>
    </Modal>
  )
}