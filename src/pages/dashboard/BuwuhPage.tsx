import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Download, Eye, Gift, Pencil, Plus, Trash2, Wheat } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/common/QueryState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { BuwuhanFormModal } from '@/components/panel/BuwuhanFormModal'
import { BuwuhanDetailModal } from '@/components/panel/BuwuhanDetailModal'
import { useStandaloneBuwuhan } from '@/hooks/useStandaloneBuwuhan'
import { useInvitations } from '@/hooks/useInvitations'
import { useTableState } from '@/hooks/useTableState'
import { downloadCsv } from '@/lib/export'
import { formatDateCompact, formatTimeCompact, formatNumber, formatRupiah } from '@/lib/format'
import { calculateBuwuhStats, getBuwuhanCategory, sumMoneyOnly } from '@/lib/buwuhHelper'
import type { ApiBuwuhan, ApiOwnerBuwuhan, BuwuhanCategory, BuwuhanPayload } from '@/types/invitation-api'

const thClass = 'px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'

/** Mendapatkan ikon kategori bantuan tanpa teks label. */
function CategoryIcon({ category }: { category: BuwuhanCategory }) {
  if (category === 'Uang') return <Banknote size={13} className="shrink-0 text-emerald-600" />
  if (category === 'Beras') return <Wheat size={13} className="shrink-0 text-amber-600" />
  return <Gift size={13} className="shrink-0 text-indigo-600" />
}

/**
 * Halaman Catatan Buwuh Tingkat Dashboard:
 * Menampilkan catatan buwuh mandiri serta ikhtisar bantuan.
 */
export default function BuwuhPage() {
  const { records, addBuwuhan, updateBuwuhan, removeBuwuhan, isLoading, isError, isMutating } =
    useStandaloneBuwuhan()
  const { invitations } = useInvitations()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApiBuwuhan | null>(null)
  const [deleting, setDeleting] = useState<ApiBuwuhan | null>(null)
  const [detailRecord, setDetailRecord] = useState<ApiBuwuhan | null>(null)

  const stats = useMemo(() => calculateBuwuhStats(records), [records])

  const getSearchText = useCallback(
    (record: ApiBuwuhan) => {
      const invTitle =
        invitations.find((i) => i.id === record.invitationId)?.title ||
        (record as ApiOwnerBuwuhan).invitationTitle ||
        ''
      return `${record.giverName} ${invTitle} ${record.giverAddress ?? ''} ${record.note ?? ''} ${record.items
        .map((i) => `${i.itemName} ${getBuwuhanCategory(i)} ${i.unit}`)
        .join(' ')}`
    },
    [invitations],
  )

  const table = useTableState({ rows: records, pageSize: 8, getSearchText })

  /** Menyimpan data formulir, otomatis memilih mode tambah atau ubah. */
  function handleSubmit(payload: BuwuhanPayload) {
    if (editing) {
      void updateBuwuhan(editing.id, payload)
    } else {
      void addBuwuhan(payload)
    }
    setEditing(null)
    setIsFormOpen(false)
  }

  /** Mengunduh seluruh baris hasil pencarian sebagai berkas CSV. */
  function handleExport() {
    const exportRows = table.filteredRows.map((record) => {
      const invTitle =
        invitations.find((i) => i.id === record.invitationId)?.title ||
        (record as ApiOwnerBuwuhan).invitationTitle ||
        '-'
      return {
        'Nama Pemberi': record.giverName,
        'Acara Undangan': invTitle,
        'Alamat Pemberi': record.giverAddress ?? '-',
        Rincian: record.items
          .map((i) => `[${getBuwuhanCategory(i)}] ${i.itemName} (${i.quantity} ${i.unit})`)
          .join('; '),
        'Nominal Uang': sumMoneyOnly(record),
        Tanggal: `${formatDateCompact(record.receivedAt)} ${formatTimeCompact(record.receivedAt)}`,
        Catatan: record.note ?? '',
      }
    })

    downloadCsv(`catatan-buwuh-${new Date().toISOString().slice(0, 10)}.csv`, exportRows)
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Halaman Catatan Buwuh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Catatan Buwuh
          </h1>
          <p className="mt-1 text-xs text-muted">
            Pencatatan buku tamu & amplop buwuhan (uang, beras, barang).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={records.length === 0}
            className="inline-flex items-center gap-1.5"
          >
            <Download size={14} />
            Ekspor Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
            className="inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            Tambah Catatan
          </Button>
        </div>
      </div>

      {/* 3 Kartu Statistik Utama: Total Uang, Total Beras, dan Total Barang */}
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
          title="Riwayat Bantuan"
          toolbar={
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari nama pemberi, undangan, alamat, atau jenis barang..."
              className="sm:w-80"
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
          <table className="w-full min-w-3xl text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className={thClass}>Pemberi / Tamu</th>
                <th className={thClass}>Acara Undangan</th>
                <th className={thClass}>Alamat Pemberi</th>
                <th className={thClass}>Rincian Bantuan</th>
                <th className={thClass}>Nominal Uang</th>
                <th className={thClass}>Waktu Penerimaan</th>
                <th className={`${thClass} text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted">
                    Belum ada catatan bantuan. Klik &quot;Tambah Catatan&quot; untuk mulai mencatat bantuan tamu.
                  </td>
                </tr>
              ) : (
                table.pageRows.map((record) => {
                  const ownerRecord = record as ApiOwnerBuwuhan
                  const invTitle =
                    invitations.find((i) => i.id === record.invitationId)?.title ||
                    ownerRecord.invitationTitle ||
                    'Undangan Digital'

                  return (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
                      <td className={tdClass}>
                        <p className="font-bold text-ink">{record.giverName}</p>
                        {record.note && (
                          <p className="mt-0.5 max-w-[180px] break-words text-[11px] italic leading-snug text-slate-500">
                            &quot;{record.note}&quot;
                          </p>
                        )}
                      </td>
                      <td className={tdClass}>
                        {record.invitationId && record.invitationId !== 'standalone' ? (
                          <Link
                            to={`/dashboard/undangan/${record.invitationId}/catatan-buwuh`}
                            className="font-medium text-primary hover:underline"
                          >
                            {invTitle}
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <span className="block max-w-[160px] break-words text-xs text-slate-600">
                          {record.giverAddress || '-'}
                        </span>
                      </td>
                      <td className={`${tdClass} text-slate-700`}>
                        <div className="space-y-2">
                          {record.items.map((item) => {
                            const cat = getBuwuhanCategory(item)
                            return (
                              <div key={item.id} className="text-xs">
                                <div className="flex items-center gap-1.5">
                                  <CategoryIcon category={cat} />
                                  <span className="font-semibold text-slate-800">
                                    {item.itemName}
                                  </span>
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
                      <td className={`${tdClass} text-slate-500`}>
                        <span className="block text-xs">{formatDateCompact(record.receivedAt)}</span>
                        <span className="block text-[11px] text-slate-400">{formatTimeCompact(record.receivedAt)}</span>
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailRecord(record)}
                            title="Lihat detail"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(record)
                              setIsFormOpen(true)
                            }}
                            title="Ubah"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(record)}
                            title="Hapus"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableCard>
      </QueryState>

      {/* Modal Formulir Tambah / Ubah Catatan Buwuh */}
      {isFormOpen && (
        <BuwuhanFormModal
          isOpen
          onClose={() => {
            setIsFormOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSubmit}
          initialValue={editing}
          isSubmitting={isMutating}
        />
      )}

      {/* Modal Detail Catatan Buwuh */}
      {detailRecord && (
        <BuwuhanDetailModal
          buwuhanId={detailRecord.id}
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onEdit={(rec) => {
            setDetailRecord(null)
            setEditing(rec)
            setIsFormOpen(true)
          }}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleting && (
        <Modal
          isOpen
          onClose={() => setDeleting(null)}
          title="Hapus Catatan Buwuh"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Apakah Anda yakin ingin menghapus catatan buwuh dari{' '}
              <strong className="text-ink">{deleting.giverName}</strong>?
            </p>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isMutating}
                onClick={() => {
                  void removeBuwuhan(deleting.id)
                  setDeleting(null)
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}