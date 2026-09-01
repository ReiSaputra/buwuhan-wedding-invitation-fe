import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Package, Pencil, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { BuwuhanFormModal } from '@/components/panel/BuwuhanFormModal'
import { QueryState } from '@/components/common/QueryState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useBuwuhan } from '@/hooks/useBuwuhan'
import { useTableState } from '@/hooks/useTableState'
import { downloadCsv } from '@/lib/export'
import { formatDateId, formatNumber, formatRupiah, getInitial } from '@/lib/format'
import type { ApiBuwuhan, BuwuhanPayload } from '@/types/invitation-api'

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/** Menjumlahkan estimasi nilai seluruh item dalam satu transaksi buwuh. */
function sumEstimatedValue(record: ApiBuwuhan): number {
  return record.items.reduce((total, item) => total + (item.estimatedValue ?? 0), 0)
}

/**
 * Halaman Catatan Buwuh: mencatat bantuan berupa barang dari tamu beserta
 * estimasi nilainya, tersambung penuh ke modul buwuhan di backend.
 */
export default function PanelCatatanBuwuhPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { records, summary, addBuwuhan, updateBuwuhan, removeBuwuhan, isLoading, isError, isMutating } =
    useBuwuhan(id)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApiBuwuhan | null>(null)
  const [deleting, setDeleting] = useState<ApiBuwuhan | null>(null)

  const getSearchText = useCallback(
    (record: ApiBuwuhan) =>
      `${record.giverName} ${record.note ?? ''} ${record.items.map((i) => i.itemName).join(' ')}`,
    [],
  )

  const table = useTableState({ rows: records, pageSize: 8, getSearchText })

  /** Menyimpan data formulir, otomatis memilih mode tambah atau ubah. */
  function handleSubmit(payload: BuwuhanPayload) {
    if (editing) void updateBuwuhan(editing.id, payload)
    else void addBuwuhan(payload)
    setEditing(null)
  }

  /** Mengunduh seluruh baris hasil pencarian sebagai berkas CSV. */
  function handleExport() {
    downloadCsv(
      `catatan-buwuh-${invitation.slug || 'undangan'}.csv`,
      table.filteredRows.map((record) => ({
        'Nama Pemberi': record.giverName,
        Bantuan: record.items.map((i) => `${i.itemName} ${i.quantity} ${i.unit}`).join(', '),
        'Estimasi Nilai': sumEstimatedValue(record),
        Tanggal: formatDateId(record.receivedAt),
        Catatan: record.note ?? '',
      })),
    )
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
        subtitle="Pencatatan bantuan berupa barang dari tamu beserta estimasi nilainya."
        actions={
          <>
            <Button variant="outline" icon={<Download size={15} />} onClick={handleExport} disabled={table.filteredRows.length === 0}>
              Ekspor CSV
            </Button>
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => { setEditing(null); setIsFormOpen(true) }}>
              Tambah Catatan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Transaksi" value={formatNumber(summary.totalTransactions)} icon={<Wallet size={18} />} colorAccent="indigo" />
        <StatCard label="Estimasi Nilai" value={formatRupiah(summary.totalEstimatedValue)} icon={<TrendingUp size={18} />} variant="filled" />
        <StatCard label="Total Item" value={formatNumber(summary.totalItems)} icon={<Package size={18} />} colorAccent="emerald" hint={`${formatNumber(summary.totalItemsThisMonth)} bulan ini`} />
        <StatCard label="Item Terbanyak" value={summary.topItem?.itemName ?? '-'} icon={<Package size={18} />} colorAccent="amber" hint={summary.topItem ? `${summary.topItem.totalQuantity} ${summary.topItem.unit}` : 'Belum ada data'} />
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        <TableCard
          title="Daftar Catatan Buwuh"
          toolbar={
            <SearchInput value={table.query} onChange={table.setQuery} placeholder="Cari pemberi atau nama barang..." className="sm:w-64" />
          }
          footerLeft={
            table.total === 0
              ? 'Belum ada catatan buwuh'
              : `Menampilkan ${table.from}-${table.to} dari ${formatNumber(table.total)} catatan`
          }
          footerRight={<Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />}
        >
          <table className="w-full min-w-3xl text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th className={thClass}>Pemberi</th>
                <th className={thClass}>Rincian Bantuan</th>
                <th className={thClass}>Estimasi Nilai</th>
                <th className={thClass}>Tanggal</th>
                <th className={`${thClass} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    Belum ada catatan buwuh yang tercatat.
                  </td>
                </tr>
              )}
              {table.pageRows.map((record) => (
                <tr key={record.id} className="transition hover:bg-slate-50/70">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100/80 bg-indigo-50 text-xs font-bold text-primary">
                        {getInitial(record.giverName)}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-ink">{record.giverName}</span>
                        {record.note && <span className="text-[11px] text-slate-400">{record.note}</span>}
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="space-y-0.5">
                      {record.items.map((item) => (
                        <div key={item.id} className="text-slate-700">
                          {item.itemName} — {item.quantity} {item.unit}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={`${tdClass} font-bold text-ink`}>{formatRupiah(sumEstimatedValue(record))}</td>
                  <td className={tdClass}>{formatDateId(record.receivedAt)}</td>
                  <td className={tdClass}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" onClick={() => { setEditing(record); setIsFormOpen(true) }} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label={`Ubah catatan ${record.giverName}`}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => setDeleting(record)} className="rounded-xl p-2 text-slate-400 transition hover:bg-danger-light hover:text-danger" aria-label={`Hapus catatan ${record.giverName}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>

      <BuwuhanFormModal
        key={`${isFormOpen}-${editing?.id ?? 'baru'}`}
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialValue={editing}
        isSubmitting={isMutating}
      />

      <Modal isOpen={deleting !== null} onClose={() => setDeleting(null)} title="Hapus Catatan Buwuh?" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-600">
            Hapus catatan dari <strong>"{deleting?.giverName}"</strong>? Seluruh item di dalamnya ikut terhapus dan tidak dapat dipulihkan.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>Batal</Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isMutating}
              onClick={() => { if (deleting) { void removeBuwuhan(deleting.id); setDeleting(null) } }}
            >
              {isMutating ? 'Menghapus…' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}