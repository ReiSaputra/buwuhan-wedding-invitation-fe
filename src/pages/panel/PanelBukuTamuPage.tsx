import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { GuestFormModal } from '@/components/panel/GuestFormModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useGuestBook } from '@/hooks/useGuestBook'
import { useTableState } from '@/hooks/useTableState'
import { downloadCsv } from '@/lib/export'
import { formatDateId, formatNumber, formatTimeWib } from '@/lib/format'
import type { AttendanceStatus, GuestBookEntry, NewGuestInput } from '@/types/panel'

const filterOptions: Array<{ value: AttendanceStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua Kehadiran' },
  { value: 'HADIR', label: 'Hadir' },
  { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
]

const thClass = 'px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'
const iconButtonClass =
  'rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer'

/**
 * Halaman Buku Tamu pada panel undangan.
 *
 * Berbeda dari RSVP yang mencatat konfirmasi sebelum acara, halaman ini
 * mencatat kehadiran nyata di lokasi beserta ucapan yang ditinggalkan tamu,
 * sehingga tiap baris punya kolom waktu check-in.
 */
export default function PanelBukuTamuPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { entries, stats, addGuest, updateGuest, removeGuest } = useGuestBook(id)

  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GuestBookEntry | null>(null)
  const [viewedMessage, setViewedMessage] = useState<GuestBookEntry | null>(null)

  const getSearchText = useCallback(
    (entry: GuestBookEntry) => `${entry.name} ${entry.category}`,
    [],
  )

  const filterFn = useCallback(
    (entry: GuestBookEntry) => statusFilter === 'ALL' || entry.status === statusFilter,
    [statusFilter],
  )

  const table = useTableState({ rows: entries, pageSize: 8, getSearchText, filterFn })

  /** Menyimpan hasil formulir, baik untuk tamu baru maupun perubahan data. */
  function handleFormSubmit(input: NewGuestInput) {
    if (editingEntry) {
      updateGuest(editingEntry.id, input)
    } else {
      addGuest(input)
    }
    setEditingEntry(null)
  }

  /** Membuka formulir dalam mode ubah dengan data baris terpilih. */
  function handleEdit(entry: GuestBookEntry) {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  /** Meminta konfirmasi sebelum menghapus catatan tamu. */
  function handleDelete(entry: GuestBookEntry) {
    const isConfirmed = window.confirm(
      `Hapus catatan tamu "${entry.name}"? Tindakan ini tidak bisa dibatalkan.`,
    )
    if (isConfirmed) removeGuest(entry.id)
  }

  /** Mengunduh seluruh baris hasil pencarian dan filter sebagai berkas CSV. */
  function handleExport() {
    // Kunci objek dipakai sebagai judul kolom di berkas CSV
    downloadCsv(
      `buku-tamu-${invitation.slug}.csv`,
      table.filteredRows.map((entry) => ({
        'Nama Tamu': entry.name,
        Kategori: entry.category,
        Status: entry.status === 'HADIR' ? 'Hadir' : 'Tidak Hadir',
        Tanggal: formatDateId(entry.recordedAt),
        Waktu: formatTimeWib(entry.recordedAt),
        'Nomor HP': entry.phone ?? '',
        Ucapan: entry.message ?? '',
      })),
    )
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Undangan', to: `/dashboard/undangan/${id}` },
          { label: 'Buku Tamu' },
        ]}
        title="Buku Tamu"
        subtitle={`${formatNumber(stats.hadir)} tamu tercatat hadir dari ${formatNumber(stats.total)} catatan`}
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={handleExport}
              disabled={table.filteredRows.length === 0}
            >
              Ekspor Data
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => {
                setEditingEntry(null)
                setIsFormOpen(true)
              }}
            >
              Tambah Tamu
            </Button>
          </>
        }
      />

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari nama tamu..."
              className="sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AttendanceStatus | 'ALL')
                table.resetPage()
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer"
              aria-label="Saring berdasarkan kehadiran"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        }
        footerLeft={
          table.total === 0
            ? 'Tidak ada tamu yang cocok'
            : `Menampilkan ${table.from}-${table.to} dari ${formatNumber(table.total)} tamu`
        }
        footerRight={
          <Pagination
            page={table.page}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
          />
        }
      >
        <table className="w-full min-w-3xl text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <th className={thClass}>Nama Tamu</th>
              <th className={thClass}>Kategori</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Waktu</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {table.pageRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted">
                  Belum ada tamu yang cocok dengan pencarian atau filter ini.
                </td>
              </tr>
            )}

            {table.pageRows.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-slate-50/70">
                <td className={`${tdClass} font-bold text-ink`}>{entry.name}</td>
                <td className={`${tdClass} text-slate-600`}>{entry.category}</td>

                <td className={tdClass}>
                  <span className="inline-flex items-center gap-2 font-medium text-slate-600">
                    {entry.status === 'HADIR' ? (
                      <span className="h-2 w-2 rounded-full bg-success" />
                    ) : (
                      <span className="h-2 w-2 rounded-full border border-slate-300 bg-white" />
                    )}
                    {entry.status === 'HADIR' ? 'Hadir' : 'Tidak Hadir'}
                  </span>
                </td>

                <td className={tdClass}>
                  <div className="font-medium text-slate-600">
                    {formatDateId(entry.recordedAt)}
                  </div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                    {formatTimeWib(entry.recordedAt)}
                  </div>
                </td>

                <td className={tdClass}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className={iconButtonClass}
                      aria-label={`Ubah data ${entry.name}`}
                      title="Ubah data tamu"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-danger-light hover:text-danger cursor-pointer"
                      aria-label={`Hapus catatan ${entry.name}`}
                      title="Hapus catatan"
                    >
                      <Trash2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewedMessage(entry)}
                      disabled={!entry.message}
                      className={`${iconButtonClass} disabled:opacity-30 disabled:pointer-events-none`}
                      aria-label={`Lihat ucapan ${entry.name}`}
                      title={entry.message ? 'Lihat ucapan' : 'Tamu ini tidak meninggalkan ucapan'}
                    >
                      <MessageSquare size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* Formulir tambah dan ubah tamu */}
      <GuestFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingEntry(null)
        }}
        onSubmit={handleFormSubmit}
        initialValue={
          editingEntry
            ? {
                name: editingEntry.name,
                category: editingEntry.category,
                phone: editingEntry.phone,
                note: editingEntry.message,
              }
            : null
        }
      />

      {/* Ucapan tamu */}
      <Modal
        isOpen={viewedMessage !== null}
        onClose={() => setViewedMessage(null)}
        title="Ucapan Tamu"
        description={viewedMessage ? `Dari ${viewedMessage.name}` : undefined}
        maxWidth="md"
      >
        <blockquote className="rounded-xl border-l-4 border-primary bg-surface-subtle px-4 py-3.5 text-xs leading-relaxed text-slate-600 italic">
          {viewedMessage?.message}
        </blockquote>

        {viewedMessage && (
          <p className="mt-3 text-[11px] text-slate-400">
            Ditulis {formatDateId(viewedMessage.recordedAt)} pukul{' '}
            {formatTimeWib(viewedMessage.recordedAt)}
          </p>
        )}
      </Modal>
    </div>
  )
}
