import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Copy, CreditCard, Trash2, UsersRound } from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { RowActions } from '@/components/ui/RowActions'
import { Badge } from '@/components/ui/Badge'
import { useGifts } from '@/hooks/useGifts'
import { formatDateId, formatNumber, formatRupiah, formatTimeWib, getInitial } from '@/lib/format'
import type { GiftRecord } from '@/types/panel'

/** Jumlah baris yang ditampilkan pertama kali dan setiap kali tombol muat ditekan. */
const PAGE_STEP = 6

const thClass = 'px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'

/**
 * Halaman Hadiah pada panel undangan.
 * Mencatat pemberian tamu berupa uang maupun barang, memakai pola
 * "Muat Lebih Banyak" karena daftarnya bersifat riwayat yang terus bertambah.
 */
export default function PanelHadiahPage() {
  const { id = '' } = useParams()
  const { gifts, stats, removeGift } = useGifts(id)

  const [visibleCount, setVisibleCount] = useState(PAGE_STEP)

  const visibleGifts = gifts.slice(0, visibleCount)
  const hasMore = visibleCount < gifts.length

  /** Menyalin rincian satu pemberian sebagai teks siap tempel. */
  async function handleCopyDetail(gift: GiftRecord) {
    const value = gift.kind === 'UANG' ? formatRupiah(gift.amount ?? 0) : (gift.itemName ?? '-')
    await navigator.clipboard.writeText(
      `${gift.guestName} - ${value} - ${gift.methodLabel} - ${formatDateId(gift.createdAt)}`,
    )
  }

  /** Meminta konfirmasi sebelum menghapus catatan pemberian. */
  function handleDelete(gift: GiftRecord) {
    const isConfirmed = window.confirm(
      `Hapus catatan pemberian dari "${gift.guestName}"? Tindakan ini tidak bisa dibatalkan.`,
    )
    if (isConfirmed) removeGift(gift.id)
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Undangan', to: `/dashboard/undangan/${id}` },
          { label: 'Hadiah' },
        ]}
        title="Hadiah"
        subtitle="Catatan pemberian dari para tamu"
      />

      {/* Dua kartu rekap */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Donasi (Uang)"
          value={formatRupiah(stats.totalAmount)}
          icon={<CreditCard size={18} />}
          variant="filled"
          hint="Gabungan transfer digital dan amplop di lokasi"
        />
        <StatCard
          label="Partisipasi Tamu"
          value={`${formatNumber(stats.participantCount)} Orang`}
          icon={<UsersRound size={18} />}
          colorAccent="emerald"
          hint="Tamu yang memberi uang maupun barang"
        />
      </div>

      <TableCard
        title="Riwayat Pemberian"
        footerLeft={`Menampilkan ${visibleGifts.length} dari ${formatNumber(gifts.length)} catatan`}
      >
        <table className="w-full min-w-3xl text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <th className={thClass}>Nama Tamu</th>
              <th className={thClass}>Jenis</th>
              <th className={thClass}>Nominal / Item</th>
              <th className={thClass}>Metode</th>
              <th className={thClass}>Tanggal</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {visibleGifts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  Belum ada catatan pemberian dari tamu.
                </td>
              </tr>
            )}

            {visibleGifts.map((gift) => (
              <tr key={gift.id} className="transition hover:bg-slate-50/70">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {getInitial(gift.guestName)}
                    </span>
                    <span className="font-bold text-ink">{gift.guestName}</span>
                  </div>
                </td>

                <td className={tdClass}>
                  <Badge variant={gift.kind === 'UANG' ? 'primary' : 'warning'}>
                    {gift.kind === 'UANG' ? 'Uang' : 'Barang'}
                  </Badge>
                </td>

                <td className={`${tdClass} font-bold text-ink`}>
                  {gift.kind === 'UANG' ? formatRupiah(gift.amount ?? 0) : gift.itemName}
                </td>

                <td className={`${tdClass} text-slate-600`}>
                  {gift.methodLabel}
                  <span className="ml-1 text-slate-400">
                    ({gift.isDigital ? 'Digital' : 'Manual'})
                  </span>
                </td>

                <td className={`${tdClass} text-slate-600`}>
                  <div className="font-medium">{formatDateId(gift.createdAt)}</div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                    {formatTimeWib(gift.createdAt)}
                  </div>
                </td>

                <td className={tdClass}>
                  <RowActions
                    actions={[
                      {
                        label: 'Salin Rincian',
                        icon: <Copy size={14} />,
                        onClick: () => {
                          void handleCopyDetail(gift)
                        },
                      },
                      {
                        label: 'Hapus Catatan',
                        icon: <Trash2 size={14} />,
                        onClick: () => handleDelete(gift),
                        isDanger: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* Tombol muat lebih banyak, sesuai desain */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 py-3.5 text-xs font-semibold text-slate-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer"
        >
          Muat Lebih Banyak
          <ChevronDown size={15} />
        </button>
      )}
    </div>
  )
}
