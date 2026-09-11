import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Banknote, Download, Eye, Gift, Pencil, Plus, Trash2, Wheat } from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { BuwuhanFormModal } from '@/components/panel/BuwuhanFormModal'
import { BuwuhanDetailModal } from '@/components/panel/BuwuhanDetailModal'
import { QueryState } from '@/components/common/QueryState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { useInvitationDetail, useCurrentInvitationRole } from '@/hooks/useInvitationDetail'
import { useBuwuhan } from '@/hooks/useBuwuhan'
import { useTableState } from '@/hooks/useTableState'
import { exportBuwuhanData } from '@/lib/export'
import { formatDateCompact, formatTimeCompact, formatNumber, formatRupiah, getInitial } from '@/lib/format'
import { calculateBuwuhStats, getBuwuhanCategory, sumMoneyOnly } from '@/lib/buwuhHelper'
import type { ApiBuwuhan, BuwuhanCategory, BuwuhanPayload } from '@/types/invitation-api'

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/** Mendapatkan ikon kategori bantuan tanpa teks label. */
function CategoryIcon({ category }: { category: BuwuhanCategory }) {
  if (category === 'Uang') return <Banknote size={13} className="shrink-0 text-emerald-600" />
  if (category === 'Beras') return <Wheat size={13} className="shrink-0 text-amber-600" />
  return <Gift size={13} className="shrink-0 text-indigo-600" />
}

// /** Komponen badge penanda 3 jenis bantuan utama */
// function CategoryBadge({ category }: { category: BuwuhanCategory }) {
//   if (category === 'Uang') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs">
//         <Banknote size={12} className="text-emerald-600" />
//         Uang
//       </span>
//     )
//   }

//   if (category === 'Beras') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 shadow-2xs">
//         <Wheat size={12} className="text-amber-600" />
//         Beras
//       </span>
//     )
//   }

//   return (
//     <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-2xs">
//       <Gift size={12} className="text-indigo-600" />
//       Barang
//     </span>
//   )
// }

/**
 * Halaman Catatan Buwuh pada panel undangan: mencatat bantuan tamu yang diklasifikasikan
 * ke dalam 3 jenis utama: Total Uang, Total Beras, dan Total Barang.
 */
export default function PanelCatatanBuwuhPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { role: currentRole, canManageGuests } = useCurrentInvitationRole(id)
  const currentMemberId = typeof window !== 'undefined' ? localStorage.getItem('buwuhan_current_member_id') : null
  const isOwnerOrAdmin = currentRole === 'OWNER' || currentRole === 'ADMIN' || canManageGuests
  const { records, addBuwuhan, updateBuwuhan, removeBuwuhan, isLoading, isError, isMutating } =
    useBuwuhan(id)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApiBuwuhan | null>(null)
  const [deleting, setDeleting] = useState<ApiBuwuhan | null>(null)
  // ID catatan yang detailnya sedang dibuka (GET /buwuhans/:id)
  const [detailId, setDetailId] = useState<string | null>(null)

  const stats = useMemo(() => calculateBuwuhStats(records), [records])

  const getSearchText = useCallback(
    (record: ApiBuwuhan) =>
      `${record.giverName} ${record.note ?? ''} ${record.items
        .map((i) => `${i.itemName} ${getBuwuhanCategory(i)} ${i.unit}`)
        .join(' ')}`,
    [],
  )

  const table = useTableState({ rows: records, pageSize: 8, getSearchText })

  /** Menyimpan data formulir, otomatis memilih mode tambah atau ubah. */
  function handleSubmit(payload: BuwuhanPayload) {
    if (editing) void updateBuwuhan(editing.id, payload)
    else void addBuwuhan(payload)
    setEditing(null)
  }

  /** Mengunduh seluruh baris hasil pencarian sebagai berkas XLSX/CSV. */
  async function handleExport() {
    const fallbackRows = table.filteredRows.map((record) => ({
      'Nama Pemberi': record.giverName,
      'Alamat Pemberi': record.giverAddress ?? '-',
      Rincian: record.items
        .map((i) => `[${getBuwuhanCategory(i)}] ${i.itemName} (${i.quantity} ${i.unit})`)
        .join('; '),
      'Nominal Uang': sumMoneyOnly(record),
      Tanggal: `${formatDateCompact(record.receivedAt)} ${formatTimeCompact(record.receivedAt)}`,
      Catatan: record.note ?? '',
    }))
    try {
      await exportBuwuhanData(id, 'xlsx', fallbackRows)
    } catch {
      alert('Gagal mengekspor catatan buwuh')
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: 'Catatan Buwuh' },
        ]}
        title="Catatan Buwuh"
        subtitle="Pencatatan bantuan dari tamu: Uang, Beras, atau Barang beserta estimasi nilainya."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={handleExport}
              disabled={table.filteredRows.length === 0}
            >
              Ekspor CSV
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => {
                setEditing(null)
                setIsFormOpen(true)
              }}
            >
              Tambah Catatan
            </Button>
          </>
        }
      />

      {/* 3 Kartu Statistik Utama: Total Uang, Total Beras, Total Barang */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Uang"
          value={formatRupiah(stats.totalMoney)}
          icon={<Banknote size={18} />}
          hint={`${formatNumber(stats.moneyTransactions)} amplop / transaksi uang`}
          colorAccent="emerald"
        />
        <StatCard
          label="Total Beras"
          value={`${formatNumber(stats.totalRiceKg)} kg`}
          icon={<Wheat size={18} />}
          hint={`${formatNumber(stats.riceTransactions)} pemberian beras tercatat`}
          colorAccent="amber"
        />
        <StatCard
          label="Total Barang"
          value={`${formatNumber(stats.totalGoodsCount)} Item`}
          icon={<Gift size={18} />}
          hint={`${formatNumber(stats.goodsTransactions)} jenis barang fisik tercatat`}
          colorAccent="violet"
        />
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        <TableCard
          title="Daftar Catatan Buwuh"
          toolbar={
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari pemberi, barang, atau jenis (uang, beras, barang)..."
              className="sm:w-72"
            />
          }
          footerLeft={
            table.total === 0
              ? 'Belum ada catatan buwuh'
              : `Menampilkan ${table.from}-${table.to} dari ${formatNumber(table.total)} catatan`
          }
          footerRight={
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          }
        >
          <table className="w-full min-w-3xl text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th className={thClass}>Pemberi</th>
                <th className={thClass}>Alamat Pemberi</th>
                <th className={thClass}>Rincian Bantuan</th>
                <th className={thClass}>Nominal Uang</th>
                <th className={thClass}>Pencatat (Audit)</th>
                <th className={thClass}>Tanggal</th>
                <th className={`${thClass} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    Belum ada catatan buwuh yang tercatat.
                  </td>
                </tr>
              )}
              {table.pageRows.map((record) => {
                return (
                  <tr key={record.id} className="transition hover:bg-slate-50/70">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100/80 bg-indigo-50 text-xs font-bold text-primary">
                          {getInitial(record.giverName)}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <span className="block text-xs font-bold text-ink">{record.giverName}</span>
                          {record.note && (
                            <span className="block break-words text-[11px] leading-snug text-slate-400">"{record.note}"</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className="block max-w-[180px] break-words text-xs text-slate-600">
                        {record.giverAddress || '-'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="space-y-2">
                        {record.items.map((item) => {
                          const cat = getBuwuhanCategory(item)
                          return (
                            <div key={item.id} className="text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <CategoryIcon category={cat} />
                                <span className="font-semibold text-slate-800">{item.itemName}</span>
                              </div>
                              <span className="ml-5 text-[11px] text-slate-500">
                                {cat === 'Uang'
                                  ? formatRupiah(item.estimatedValue ?? item.quantity)
                                  : `${item.quantity} ${item.unit}`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className={`${tdClass} font-bold text-ink`}>
                      {formatRupiah(sumMoneyOnly(record))}
                    </td>
                                        {/* Kolom Pencatat (Audit Log) */}
                    <td className={tdClass}>
                      {record.recordedBy?.name ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs">
                          Petugas: {record.recordedBy.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                          Owner (Pemilik)
                        </span>
                      )}
                    </td>

                    <td className={`${tdClass} text-slate-600`}>
                      <span className="block text-xs">{formatDateCompact(record.receivedAt)}</span>
                      <span className="block text-[11px] text-slate-400">{formatTimeCompact(record.receivedAt)}</span>
                    </td>

                    <td className={tdClass}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailId(record.id)}
                          className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-primary"
                          aria-label={`Lihat detail catatan ${record.giverName}`}
                          title="Lihat rincian per item"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Tombol Ubah: Owner/Admin bisa edit semua, Petugas HANYA bisa edit catatannya sendiri */}
                        {(isOwnerOrAdmin || (currentMemberId && record.recordedBy?.memberId === currentMemberId)) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(record)
                              setIsFormOpen(true)
                            }}
                            className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                            aria-label={`Ubah catatan ${record.giverName}`}
                            title="Ubah data catatan"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* Tombol Hapus: Sembunyikan untuk Petugas, HANYA tampil untuk Owner & Admin */}
                        {isOwnerOrAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeleting(record)}
                            className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-danger"
                            aria-label={`Hapus catatan ${record.giverName}`}
                            title="Hapus catatan"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableCard>
      </QueryState>

      {/* Modal Detail Rincian Catatan Buwuh */}
      {detailId && (
        <BuwuhanDetailModal
          invitationId={id}
          buwuhanId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(record) => {
            setDetailId(null)
            setEditing(record)
            setIsFormOpen(true)
          }}
        />
      )}

      <BuwuhanFormModal
        key={`${isFormOpen}-${editing?.id ?? 'baru'}`}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        initialValue={editing}
        isSubmitting={isMutating}
        defaultInvitationId={id}
      />

      <Modal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus Catatan Buwuh?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-600">
            Hapus catatan dari <strong>"{deleting?.giverName}"</strong>? Seluruh item di dalamnya ikut terhapus dan tidak dapat dipulihkan.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isMutating}
              onClick={() => {
                if (deleting) {
                  void removeBuwuhan(deleting.id)
                  setDeleting(null)
                }
              }}
            >
              {isMutating ? 'Menghapus…' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}