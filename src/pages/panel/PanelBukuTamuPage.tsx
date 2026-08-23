import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Download,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
  CheckCircle2,
  XCircle,
  MessageSquareQuote,
  Clock,
  Calendar,
} from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { GuestFormModal } from '@/components/panel/GuestFormModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useGuestBook } from '@/hooks/useGuestBook'
import { useTableState } from '@/hooks/useTableState'
import { downloadCsv } from '@/lib/export'
import { formatDateId, formatNumber, formatTimeWib, getInitial } from '@/lib/format'
import type { AttendanceStatus, GuestBookEntry, NewGuestInput } from '@/types/panel'

const filterOptions: Array<{ value: AttendanceStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua Kehadiran' },
  { value: 'HADIR', label: 'Hadir' },
  { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
]

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'
const iconButtonClass =
  'rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer'

/**
 * Halaman Manajemen Buku Tamu pada Panel Pengelolaan Undangan Spesifik.
 * Mencatat kehadiran nyata di lokasi resepsi beserta ucapan/doa restu dari tamu,
 * waktu check-in, kategori tamu, dan fitur ekspor ke Excel/CSV.
 */
export default function PanelBukuTamuPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { entries, stats, addGuest, updateGuest, removeGuest } = useGuestBook(id)

  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GuestBookEntry | null>(null)
  const [viewedMessage, setViewedMessage] = useState<GuestBookEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<GuestBookEntry | null>(null)

  const getSearchText = useCallback(
    (entry: GuestBookEntry) => `${entry.name} ${entry.category} ${entry.phone ?? ''}`,
    [],
  )

  const filterFn = useCallback(
    (entry: GuestBookEntry) => statusFilter === 'ALL' || entry.status === statusFilter,
    [statusFilter],
  )

  const table = useTableState({ rows: entries, pageSize: 8, getSearchText, filterFn })

  const hadirPercentage =
    stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0

  const withMessageCount = entries.filter((e) => Boolean(e.message)).length

  /**
   * Menyimpan data dari formulir tamu, baik mode tambah tamu baru maupun edit.
   * 
   * @param input - Objek input formulir tamu
   */
  function handleFormSubmit(input: NewGuestInput) {
    if (editingEntry) {
      updateGuest(editingEntry.id, input)
    } else {
      addGuest(input)
    }
    setEditingEntry(null)
  }

  /**
   * Membuka modal formulir dalam mode ubah data tamu terpilih.
   * 
   * @param entry - Objek tamu yang ingin diedit
   */
  function handleEdit(entry: GuestBookEntry) {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  /**
   * Menampilkan modal konfirmasi sebelum menghapus data tamu.
   * 
   * @param entry - Objek tamu yang ingin dihapus
   */
  function handlePromptDelete(entry: GuestBookEntry) {
    setDeletingEntry(entry)
  }

  /**
   * Mengeksekusi penghapusan data tamu setelah dikonfirmasi pengguna.
   */
  function handleConfirmDelete() {
    if (deletingEntry) {
      removeGuest(deletingEntry.id)
      setDeletingEntry(null)
    }
  }

  /**
   * Mengunduh seluruh data baris hasil filter dan pencarian sebagai berkas CSV.
   */
  function handleExport() {
    downloadCsv(
      `buku-tamu-${invitation.slug || 'undangan'}.csv`,
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
      {/* Header Halaman */}
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: 'Buku Tamu' },
        ]}
        title="Buku Tamu & Kehadiran"
        subtitle={`Catatan tamu hadir dan buku ucapan untuk pernikahan ${invitation.coupleName}`}
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={handleExport}
              disabled={table.filteredRows.length === 0}
            >
              Ekspor Excel (CSV)
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

      {/* Kartu Ringkasan Metrik Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tamu Tercatat"
          value={formatNumber(stats.total)}
          icon={<UsersRound size={18} />}
          colorAccent="indigo"
          hint="Jumlah entri di buku tamu"
        />
        <StatCard
          label="Tamu Hadir di Lokasi"
          value={formatNumber(stats.hadir)}
          icon={<CheckCircle2 size={18} />}
          variant="filled"
          hint={`${hadirPercentage}% dari total catatan`}
        />
        <StatCard
          label="Tidak Hadir"
          value={formatNumber(stats.tidakHadir)}
          icon={<XCircle size={18} />}
          colorAccent="amber"
          hint="Berhalangan hadir"
        />
        <StatCard
          label="Tamu Memberi Ucapan"
          value={formatNumber(withMessageCount)}
          icon={<MessageSquareQuote size={18} />}
          colorAccent="emerald"
          hint="Tercatat di buku tamu"
        />
      </div>

      {/* Tabel Data Buku Tamu */}
      <TableCard
        title="Daftar Kehadiran Buku Tamu"
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari nama, kategori, atau HP..."
              className="sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AttendanceStatus | 'ALL')
                table.resetPage()
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-ink transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer shadow-2xs"
              aria-label="Saring berdasarkan status kehadiran"
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
              <th className={thClass}>Status Kehadiran</th>
              <th className={thClass}>Waktu Check-in</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {table.pageRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted">
                  <div className="mx-auto max-w-xs space-y-2">
                    <UsersRound size={28} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada tamu yang ditemukan</p>
                    <p className="text-[11px] text-slate-400">
                      Coba sesuaikan kata kunci pencarian atau filter status kehadiran.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {table.pageRows.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-slate-50/70">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-primary border border-indigo-100/80">
                      {getInitial(entry.name)}
                    </div>
                    <div>
                      <span className="font-bold text-ink block text-xs">{entry.name}</span>
                      {entry.phone && (
                        <span className="text-[11px] text-slate-400 font-mono">{entry.phone}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className={tdClass}>
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {entry.category}
                  </span>
                </td>

                <td className={tdClass}>
                  <Badge variant={entry.status === 'HADIR' ? 'success' : 'default'}>
                    {entry.status === 'HADIR' ? 'Hadir' : 'Tidak Hadir'}
                  </Badge>
                </td>

                <td className={tdClass}>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{formatDateId(entry.recordedAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock size={11} className="text-slate-400" />
                    <span>{formatTimeWib(entry.recordedAt)}</span>
                  </div>
                </td>

                <td className={tdClass}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Tombol Lihat Ucapan */}
                    <button
                      type="button"
                      onClick={() => setViewedMessage(entry)}
                      disabled={!entry.message}
                      className={`${iconButtonClass} disabled:opacity-20 disabled:pointer-events-none hover:text-primary hover:bg-indigo-50`}
                      aria-label={`Lihat ucapan ${entry.name}`}
                      title={entry.message ? 'Lihat ucapan doa' : 'Tidak meninggalkan ucapan'}
                    >
                      <MessageSquare size={15} />
                    </button>

                    {/* Tombol Ubah Data Tamu */}
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className={iconButtonClass}
                      aria-label={`Ubah data ${entry.name}`}
                      title="Ubah data tamu"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Tombol Hapus Tamu */}
                    <button
                      type="button"
                      onClick={() => handlePromptDelete(entry)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-danger-light hover:text-danger cursor-pointer"
                      aria-label={`Hapus catatan ${entry.name}`}
                      title="Hapus catatan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* Formulir Modal Tambah dan Ubah Tamu */}
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

      {/* Modal Dialog Lihat Ucapan Tamu */}
      <Modal
        isOpen={viewedMessage !== null}
        onClose={() => setViewedMessage(null)}
        title="Ucapan & Doa Restu Tamu"
        description={viewedMessage ? `Dikirimkan oleh ${viewedMessage.name}` : undefined}
        maxWidth="md"
      >
        <div className="space-y-4">
          <blockquote className="rounded-2xl border-l-4 border-primary bg-indigo-50/50 p-4 text-xs leading-relaxed text-slate-700 italic font-serif">
            "{viewedMessage?.message}"
          </blockquote>

          {viewedMessage && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>Kategori: {viewedMessage.category}</span>
              <span>
                {formatDateId(viewedMessage.recordedAt)}, {formatTimeWib(viewedMessage.recordedAt)}
              </span>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Data Tamu */}
      <Modal
        isOpen={deletingEntry !== null}
        onClose={() => setDeletingEntry(null)}
        title="Hapus Catatan Tamu?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus catatan tamu <strong>"{deletingEntry?.name}"</strong>? Data yang dihapus tidak dapat dipulihkan kembali.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingEntry(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Ya, Hapus Tamu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

