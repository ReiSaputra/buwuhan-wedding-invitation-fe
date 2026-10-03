import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  CalendarCheck2,
  CalendarX2,
  Download,
  Eye,
  ExternalLink,
  Gift,
  Pencil,
  Plus,
  Trash2,
  Wheat,
  ChevronDown,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/common/QueryState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BuwuhanFormModal } from '@/components/panel/BuwuhanFormModal'
import { BuwuhanDetailModal } from '@/components/panel/BuwuhanDetailModal'
import { useInvitations } from '@/hooks/useInvitations'
import { useBuwuhan } from '@/hooks/useBuwuhan'
import { useTableState } from '@/hooks/useTableState'
import { exportBuwuhanData } from '@/lib/export'
import { formatDateCompact, formatTimeCompact, formatNumber, formatRupiah, getInitial } from '@/lib/format'
import { calculateBuwuhStats, getBuwuhanCategory, sumMoneyOnly } from '@/lib/buwuhHelper'
import { parseApiError } from '@/lib/errorHandler'
import type { ApiBuwuhan, BuwuhanCategory, BuwuhanPayload } from '@/types/invitation-api'
import type { InvitationSummary } from '@/types/dashboard'

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/** Mendapatkan ikon kategori bantuan tanpa teks label. */
function CategoryIcon({ category }: { category: BuwuhanCategory }) {
  if (category === 'Uang') return <Banknote size={13} className="shrink-0 text-emerald-600" />
  if (category === 'Beras') return <Wheat size={13} className="shrink-0 text-amber-600" />
  return <Gift size={13} className="shrink-0 text-indigo-600" />
}

/**
 * Sub-komponen pengelola data buwuhan untuk satu event yang dipilih.
 */
function EventBuwuhContent({
  event,
}: {
  event: InvitationSummary
}) {
  const { records, addBuwuhan, updateBuwuhan, removeBuwuhan, isLoading, isError, isMutating } =
    useBuwuhan(event.id)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApiBuwuhan | null>(null)
  const [deleting, setDeleting] = useState<ApiBuwuhan | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const stats = useMemo(() => calculateBuwuhStats(records), [records])

  const getSearchText = useCallback(
    (record: ApiBuwuhan) =>
      `${record.giverName} ${record.giverAddress ?? ''} ${record.note ?? ''} ${record.items
        .map((item) => `${item.itemName} ${getBuwuhanCategory(item)} ${item.unit}`)
        .join(' ')}`,
    [],
  )

  const table = useTableState({ rows: records, pageSize: 8, getSearchText })

  /** Menyimpan data formulir catatan buwuh per-undangan */
  async function handleSubmit(payload: BuwuhanPayload) {
    try {
      if (editing) {
        await updateBuwuhan(editing.id, payload)
      } else {
        await addBuwuhan(payload)
      }
      setIsFormOpen(false)
      setEditing(null)
    } catch (err: unknown) {
      console.error('Gagal menyimpan catatan buwuh event:', err)
      const parsed = parseApiError(err)
      const errorMsg =
        parsed.generalMessage ||
        (err instanceof Error ? err.message : 'Gagal menyimpan catatan buwuh. Silakan periksa kembali data Anda.')
      alert(errorMsg)
      throw err
    }
  }

  /** Mengunduh rekapan catatan buwuh event */
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
      await exportBuwuhanData(event.id, 'xlsx', fallbackRows)
    } catch {
      alert('Gagal mengekspor data catatan buwuh event.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Kartu Informasi Event Terpilih */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-indigo-50/60 p-5 border border-indigo-100 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-ink">
                {event.coupleName || event.title}
              </h3>
              <Badge variant="success">Selesai</Badge>
              <Badge variant="outline">{event.eventCategory || 'WEDDING'}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Tanggal Acara: {event.eventDate ? formatDateCompact(event.eventDate) : '-'} • Total {records.length} catatan buwuh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/dashboard/undangan/${event.id}/catatan-buwuh`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-indigo-50 shadow-2xs"
          >
            <ExternalLink size={13} />
            Buka Panel Undangan
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={table.filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 bg-white"
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

      {/* 3 Kartu Statistik Utama Event: Total Uang, Total Beras, Total Barang */}
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

      {/* Tabel Catatan Buwuh Event */}
      <QueryState isLoading={isLoading} isError={isError}>
        <TableCard
          title={`Catatan Buwuh — ${event.coupleName || event.title}`}
          toolbar={
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari pemberi, barang, atau jenis..."
              className="sm:w-72"
            />
          }
          footerLeft={
            table.total === 0
              ? 'Belum ada catatan buwuh pada event ini'
              : `Menampilkan ${table.from}-${table.to} dari ${formatNumber(table.total)} catatan`
          }
          footerRight={
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          }
        >
          <table className="w-full min-w-3xl text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className={thClass}>Pemberi</th>
                <th className={thClass}>Alamat Pemberi</th>
                <th className={thClass}>Rincian Bantuan</th>
                <th className={thClass}>Nominal Uang</th>
                <th className={thClass}>Pencatat (Audit)</th>
                <th className={thClass}>Tanggal</th>
                <th className={`${thClass} text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    <p className="font-medium text-slate-600">Belum ada catatan buwuh untuk acara ini.</p>
                    <p className="mt-1 text-slate-400">
                      Klik &quot;Tambah Catatan&quot; untuk menambahkan catatan buwuh tamu.
                    </p>
                  </td>
                </tr>
              ) : (
                table.pageRows.map((record) => {
                  const recMemberId =
                    record.recordedByMemberId ||
                    record.recordedBy?.memberId ||
                    record.recordedBy?.id ||
                    null
                  const recName = record.recordedBy?.name || null

                  return (
                    <tr key={record.id} className="transition hover:bg-slate-50/70">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-indigo-100/80 bg-indigo-50 text-xs font-bold text-primary">
                            {getInitial(record.giverName)}
                          </div>
                          <div className="min-w-0 max-w-[180px]">
                            <span className="block text-xs font-bold text-ink">
                              {record.giverName}
                            </span>
                            {record.note && (
                              <span className="block break-words text-[11px] italic leading-snug text-slate-500 mt-0.5">
                                &quot;{record.note}&quot;
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="block max-w-[160px] break-words text-xs text-slate-600">
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
                      <td className={tdClass}>
                        {recName ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs">
                            Petugas: {recName}
                          </span>
                        ) : recMemberId ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs">
                            Petugas
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
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailId(record.id)}
                            title="Lihat rincian"
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
                            title="Ubah data"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(record)}
                            title="Hapus catatan"
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

      {/* Modal Detail Catatan Buwuh Event */}
      {detailId && (
        <BuwuhanDetailModal
          invitationId={event.id}
          buwuhanId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(rec) => {
            setDetailId(null)
            setEditing(rec)
            setIsFormOpen(true)
          }}
        />
      )}

      {/* Modal Tambah / Ubah Catatan Buwuh Event */}
      {isFormOpen && (
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
          defaultInvitationId={event.id}
          defaultInvitationTitle={event.coupleName || event.title}
          showInvitationField={false}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleting && (
        <Modal
          isOpen
          onClose={() => setDeleting(null)}
          title="Hapus Catatan Buwuh?"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Apakah Anda yakin ingin menghapus catatan dari{' '}
              <strong className="text-ink">&quot;{deleting.giverName}&quot;</strong>? Seluruh item di dalamnya ikut terhapus dan tidak dapat dipulihkan.
            </p>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isMutating}
                onClick={async () => {
                  try {
                    await removeBuwuhan(deleting.id)
                    setDeleting(null)
                  } catch (err) {
                    console.error('Gagal menghapus catatan buwuh:', err)
                    alert('Gagal menghapus catatan buwuh.')
                  }
                }}
              >
                {isMutating ? 'Menghapus…' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/**
 * Tab Konten Catatan Buwuh Event:
 * - Menampilkan dropdown pemilihan event yang HANYA berisi event berstatus 'COMPLETED' (Selesai).
 * - Event yang belum selesai (DRAFT, ACTIVE) tidak muncul di dropdown.
 * - Setelah event dipilih, menampilkan ringkasan statistik dan tabel catatan buwuh event terkait.
 */
export function CatatanBuwuhEventTab() {
  const { invitations, isLoading: isInvLoading, isError: isInvError } = useInvitations()

  // Saring HANYA event yang berstatus SELESAI (COMPLETED). Event DRAFT/ACTIVE dilarang muncul.
  const completedEvents = useMemo(() => {
    return invitations.filter((inv) => {
      const status = (inv.status || '').toUpperCase()
      return status === 'COMPLETED' || status === 'SELESAI'
    })
  }, [invitations])

  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Sinkronkan event pertama yang selesai secara default jika belum dipilih
  const currentEventId = selectedEventId || completedEvents[0]?.id || ''
  const selectedEvent = useMemo(
    () => completedEvents.find((inv) => inv.id === currentEventId) ?? completedEvents[0] ?? null,
    [completedEvents, currentEventId],
  )

  return (
    <div className="space-y-6">
      {/* Bar Pemilihan Event / Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-border shadow-2xs">
        <div className="space-y-1">
          <label htmlFor="event-select-dropdown" className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Pilih Acara Selesai (Event Selesai)
          </label>
          <p className="text-xs text-muted">
            Hanya acara yang telah berstatus <strong>Selesai</strong> yang ditampilkan pada pilihan di bawah.
          </p>
        </div>

        {/* Dropdown Pemilih Event */}
        {completedEvents.length > 0 && (
          <div className="relative min-w-[280px] sm:w-80">
            <select
              id="event-select-dropdown"
              value={selectedEvent?.id ?? ''}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-9 text-xs font-semibold text-ink shadow-2xs transition focus:border-primary focus:bg-white focus:outline-none cursor-pointer"
            >
              {completedEvents.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.coupleName || inv.title} ({inv.eventDate ? formatDateCompact(inv.eventDate) : 'Tanggal -'})
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Kondisi Loading & Error Undangan */}
      <QueryState isLoading={isInvLoading} isError={isInvError}>
        {completedEvents.length === 0 ? (
          /* Empty State Jika Belum Ada Event yang Berstatus Selesai */
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <CalendarX2 size={28} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">
              Belum Ada Acara yang Selesai
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-600">
              Catatan Buwuh Event hanya menampilkan data dari acara undangan yang telah selesai (status{' '}
              <strong className="text-amber-700">COMPLETED / Selesai</strong>). Acara yang masih dalam status Draft atau Aktif tidak ditampilkan di sini.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard/undangan">
                <Button variant="primary" size="sm">
                  Lihat & Kelola Undangan
                </Button>
              </Link>
            </div>
          </div>
        ) : selectedEvent ? (
          /* Konten Catatan Buwuh untuk Event yang Dipilih */
          <EventBuwuhContent key={selectedEvent.id} event={selectedEvent} />
        ) : null}
      </QueryState>
    </div>
  )
}
