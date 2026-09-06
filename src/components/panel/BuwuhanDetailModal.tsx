import { CalendarClock, Loader2, PackageOpen, Pencil, ServerCrash } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useBuwuhanDetail } from '@/hooks/useBuwuhanDetail'
import { formatDateId, formatNumber, formatRupiah, formatTimeWib } from '@/lib/format'
import { getBuwuhanCategory } from '@/lib/buwuhHelper'
import type { ApiBuwuhan } from '@/types/invitation-api'

export type BuwuhanDetailModalProps = {
  invitationId: string
  /** ID catatan buwuh yang dilihat. Komponen hanya dirender saat ID ada. */
  buwuhanId: string
  onClose: () => void
  /** Membuka formulir ubah untuk catatan yang sedang dilihat. */
  onEdit: (record: ApiBuwuhan) => void
}

/**
 * Modal detail satu catatan buwuh. Datanya diambil langsung lewat
 * GET /buwuhans/:id sehingga setiap item bisa ditampilkan lengkap
 * (kategori, jumlah, satuan, estimasi nilai) beserta jejak waktu pencatatan.
 */
export function BuwuhanDetailModal({
  invitationId,
  buwuhanId,
  onClose,
  onEdit,
}: BuwuhanDetailModalProps) {
  const { buwuhan, isLoading, isError } = useBuwuhanDetail(invitationId, buwuhanId)

  const totalValue =
    buwuhan?.items.reduce((total, item) => total + (item.estimatedValue ?? 0), 0) ?? 0

  const thClass =
    'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500'
  const tdClass = 'px-3 py-2.5 align-middle text-xs text-slate-700'

  return (
    <Modal isOpen onClose={onClose} title="Detail Catatan Buwuh" maxWidth="2xl">
      <>
        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="space-y-3 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
              <p className="text-xs font-medium text-slate-400">Memuat catatan buwuh…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="max-w-xs space-y-2 text-center">
              <ServerCrash size={24} className="mx-auto text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">
                Catatan buwuh tidak dapat dibuka
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Catatan ini mungkin sudah dihapus, atau bukan milik undangan Anda.
              </p>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-1">
                Tutup
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && buwuhan && (
          <div className="space-y-4">
            {/* Identitas pemberi */}
            <div className="space-y-2">
              <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                {buwuhan.giverName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" icon={<CalendarClock size={11} />}>
                  Diterima {formatDateId(buwuhan.receivedAt)}
                </Badge>
                <Badge variant="outline" icon={<PackageOpen size={11} />}>
                  {formatNumber(buwuhan.items.length)} item
                </Badge>
              </div>
            </div>

            {buwuhan.note && (
              <blockquote className="rounded-2xl border-l-4 border-primary bg-indigo-50/50 p-3.5 font-serif text-xs italic leading-relaxed text-slate-700">
                "{buwuhan.note}"
              </blockquote>
            )}

            {/* Rincian item */}
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full">
                <thead className="border-b border-slate-100 bg-slate-50/60">
                  <tr>
                    <th className={thClass}>Nama Item</th>
                    <th className={thClass}>Kategori</th>
                    <th className={thClass}>Jumlah</th>
                    <th className={`${thClass} text-right`}>Estimasi Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buwuhan.items.map((item) => (
                    <tr key={item.id}>
                      <td className={`${tdClass} font-semibold text-slate-800`}>
                        {item.itemName}
                      </td>
                      <td className={tdClass}>
                        <Badge variant="default">{getBuwuhanCategory(item)}</Badge>
                      </td>
                      <td className={tdClass}>
                        {formatNumber(item.quantity)} {item.unit}
                      </td>
                      <td className={`${tdClass} text-right font-semibold text-ink`}>
                        {item.estimatedValue === null
                          ? '—'
                          : formatRupiah(item.estimatedValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-100 bg-slate-50/60">
                  <tr>
                    <td className={`${tdClass} font-bold text-slate-600`} colSpan={3}>
                      Total Estimasi
                    </td>
                    <td className={`${tdClass} text-right font-extrabold text-ink`}>
                      {formatRupiah(totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Jejak waktu */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-2xl border border-border bg-slate-50/60 px-4 py-3 text-[11px] text-slate-500">
              <span>
                Dicatat: {formatDateId(buwuhan.createdAt)}, {formatTimeWib(buwuhan.createdAt)}
              </span>
              <span>
                Diubah: {formatDateId(buwuhan.updatedAt)}, {formatTimeWib(buwuhan.updatedAt)}
              </span>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(buwuhan)}
                className="inline-flex items-center gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Ubah Catatan
              </Button>
            </div>
          </div>
        )}
      </>
    </Modal>
  )
}