import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Trash2,
  MessageCircle,
  Copy,
  Check,
  Download,
  UsersRound,
  MoreHorizontal,
  Sparkles,
  Phone,
  Loader2,
} from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { QueryState } from '@/components/common/QueryState'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { RowActions } from '@/components/ui/RowActions'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useRsvpGuests } from '@/hooks/useRsvpGuests'
import { useGuestActions } from '@/hooks/useGuestActions'
import { useTableState } from '@/hooks/useTableState'
import { exportRsvpData } from '@/lib/export'
import { formatNumber, getInitial } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import type { RsvpGuest, RsvpStatus } from '@/types/panel'

/** Label dan warna badge untuk setiap status konfirmasi kehadiran. */
const statusMeta: Record<RsvpStatus, { label: string; variant: BadgeVariant }> = {
  HADIR: { label: 'Pasti Hadir', variant: 'success' },
  TIDAK_HADIR: { label: 'Tidak Hadir', variant: 'default' },
  BELUM_KONFIRMASI: { label: 'Belum Konfirmasi', variant: 'outline' },
}

const filterOptions: Array<{ value: RsvpStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'HADIR', label: 'Pasti Hadir' },
  { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
  { value: 'BELUM_KONFIRMASI', label: 'Belum Konfirmasi' },
]

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/**
 * Halaman Konfirmasi Kehadiran pada Panel Pengelolaan Undangan.
 * Menampilkan ringkasan status kehadiran seluruh tamu, progres persentase hadir,
 * tabel pencarian tamu, filter status, dan fitur kirim undangan via WhatsApp.
 */
export default function PanelRsvpPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { guests, stats, removeRsvp, isLoading, isError, isMutating } = useRsvpGuests(id)
  const { getGuestShareData } = useGuestActions(id)

  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeGuestActionId, setActiveGuestActionId] = useState<string | null>(null)
  const [deletingGuest, setDeletingGuest] = useState<RsvpGuest | null>(null)

  // State untuk status modal pop-up hasil kirim
  const [popupState, setPopupState] = useState<{
    isOpen: boolean
    status: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    status: 'success',
    title: '',
    message: '',
  })

  const getSearchText = useCallback(
    (guest: RsvpGuest) => `${guest.name} ${guest.phone} ${guest.category}`,
    [],
  )

  const filterFn = useCallback(
    (guest: RsvpGuest) => statusFilter === 'ALL' || guest.status === statusFilter,
    [statusFilter],
  )

  const table = useTableState({ rows: guests, pageSize: 8, getSearchText, filterFn })

  const hadirPercentage =
    stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0

  function toWidth(value: number): string {
    return stats.total > 0 ? `${(value / stats.total) * 100}%` : '0%'
  }

  async function handleCopyPhone(guestId: string, phone: string) {
    await navigator.clipboard.writeText(phone)
    setCopiedId(guestId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  /**
   * Mengambil URL & format pesan WhatsApp dari backend (GET /invitations/:id/guests/:guestId/share)
   * lalu membuka WhatsApp di tab baru.
   */
  async function handleShareWhatsApp(guest: RsvpGuest) {
    setActiveGuestActionId(guest.id)
    try {
      const shareData = await getGuestShareData(guest.id)
      const targetUrl = shareData.whatsappShareUrl || shareData.whatsappUniversalShareUrl
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noreferrer')
      } else {
        setPopupState({
          isOpen: true,
          status: 'error',
          title: 'Gagal Membuka WhatsApp',
          message: 'Tautan WhatsApp tidak dapat dibuat. Pastikan nomor HP tamu valid.',
        })
      }
    } catch (error) {
      const parsed = parseApiError(error)
      setPopupState({
        isOpen: true,
        status: 'error',
        title: 'Gagal Mengambil Data WhatsApp',
        message: parsed.generalMessage || 'Terjadi kesalahan saat menyiapkan pesan WhatsApp.',
      })
    } finally {
      setActiveGuestActionId(null)
    }
  }

  /**
   * Menghapus data konfirmasi kehadiran & ucapan seorang tamu.
   * Tamu tetap ada di Buku Tamu, statusnya kembali "Belum Konfirmasi".
   */
  async function handleConfirmDelete() {
    if (!deletingGuest?.rsvpId) return
    try {
      await removeRsvp(deletingGuest.rsvpId)
      const name = deletingGuest.name
      setDeletingGuest(null)
      setPopupState({
        isOpen: true,
        status: 'success',
        title: 'Data RSVP Dihapus',
        message: `Konfirmasi kehadiran ${name} berhasil dihapus. Tamu kembali ke status Belum Konfirmasi.`,
      })
    } catch (error) {
      const parsed = parseApiError(error)
      setPopupState({
        isOpen: true,
        status: 'error',
        title: 'Gagal Menghapus RSVP',
        message: parsed.generalMessage || 'Terjadi kesalahan saat menghapus data konfirmasi.',
      })
    }
  }

  /**
   * Mengunduh rekap konfirmasi kehadiran tamu sebagai XLSX/CSV
   */
  async function handleExportRsvp() {
    const fallbackRows = table.filteredRows.map((guest) => ({
      'Nama Tamu': guest.name,
      'Kategori Tamu': guest.category,
      'Nomor HP': guest.phone ?? '',
      'Status Kehadiran': statusMeta[guest.status]?.label || guest.status,
      'Jumlah Pax': guest.headcount ?? (guest.status === 'HADIR' ? 1 : 0),
    }))
    try {
      await exportRsvpData(id, 'xlsx', fallbackRows)
      console.info('Export berhasil! Data RSVP telah diunduh.')
    } catch {
      alert('Gagal mengekspor data konfirmasi kehadiran. Silakan periksa koneksi dan coba lagi.')
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Halaman */}
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: 'Kehadiran' },
        ]}
        title="Konfirmasi Kehadiran"
        subtitle={`Pantau rekap kehadiran tamu untuk acara pernikahan ${invitation.coupleName}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportRsvp}
            disabled={guests.length === 0}
          >
            Export Excel
          </Button>
        }
      />

      {/* Kartu Ringkasan Metrik Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tamu Undangan"
          value={formatNumber(stats.total)}
          icon={<UsersRound size={18} />}
          colorAccent="indigo"
          hint="Kapasitas undangan terdata"
        />
        <StatCard
          label="Konfirmasi Hadir"
          value={formatNumber(stats.hadir)}
          icon={<CheckCircle2 size={18} />}
          variant="filled"
          hint={`${hadirPercentage}% dari total undangan`}
        />
        <StatCard
          label="Tidak Dapat Hadir"
          value={formatNumber(stats.tidakHadir)}
          icon={<XCircle size={18} />}
          colorAccent="amber"
          hint="Berhalangan hadir"
        />
        <StatCard
          label="Belum Konfirmasi"
          value={formatNumber(stats.belumKonfirmasi)}
          icon={<MoreHorizontal size={18} />}
          colorAccent="violet"
          hint="Perlu pengingat via WhatsApp"
        />
      </div>

      {/* Progress Bar Visual Kehadiran */}
      <div className="rounded-3xl border border-border bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" />
            Tingkat Respon Kehadiran Tamu
          </span>
          <span className="font-display font-bold text-primary text-sm">
            {stats.hadir} Hadir ({hadirPercentage}%)
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: toWidth(stats.hadir) }}
            title={`Hadir: ${stats.hadir}`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: toWidth(stats.tidakHadir) }}
            title={`Tidak Hadir: ${stats.tidakHadir}`}
          />
          <div
            className="h-full bg-slate-200 transition-all duration-500"
            style={{ width: toWidth(stats.belumKonfirmasi) }}
            title={`Belum Konfirmasi: ${stats.belumKonfirmasi}`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted pt-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {stats.hadir} Pasti Hadir
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {stats.tidakHadir} Tidak Hadir
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {stats.belumKonfirmasi} Belum Menanggapi
          </span>
        </div>
      </div>

      {/* Tabel Konfirmasi Kehadiran Tamu */}
      <QueryState
        isLoading={isLoading}
        isError={isError}
      >
        <TableCard
          title="Daftar Konfirmasi Tamu"
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Cari nama atau nomor kontak..."
                value={table.query}
                onChange={table.setQuery}
                className="w-full sm:w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RsvpStatus | 'ALL')}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          }
          footerLeft={`Menampilkan ${table.pageRows.length} dari ${table.filteredRows.length} tamu`}
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
                <th className={thClass}>Kontak Tamu</th>
                <th className={thClass}>Kategori</th>
                <th className={thClass}>Jumlah Pax</th>
                <th className={thClass}>Status Kehadiran</th>
                <th className={`${thClass} text-right`}>Aksi Undangan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted">
                    <div className="mx-auto max-w-xs space-y-2">
                      <UsersRound size={28} className="mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada tamu yang cocok</p>
                      <p className="text-[11px] text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau filter status kehadiran.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {table.pageRows.map((guest) => {
                const isOperating = activeGuestActionId === guest.id
                return (
                  <tr key={guest.id} className="transition hover:bg-slate-50/70">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-primary border border-indigo-100/80">
                          {getInitial(guest.name)}
                        </div>
                        <div>
                          <span className="font-bold text-ink block text-xs">{guest.name}</span>
                          <span className="text-[11px] text-slate-400">ID: {guest.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className={`${tdClass} text-slate-600`}>
                      {guest.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          <span className="tabular-nums font-mono text-xs">{guest.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">No HP: -</span>
                      )}
                    </td>

                    <td className={tdClass}>
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {guest.category}
                      </span>
                    </td>

                    <td className={`${tdClass} text-slate-700 font-semibold`}>
                      {guest.headcount === null ? (
                        <span className="text-slate-300 font-normal">&mdash;</span>
                      ) : (
                        `${guest.headcount} Orang`
                      )}
                    </td>

                    <td className={tdClass}>
                      <Badge variant={statusMeta[guest.status].variant}>
                        {statusMeta[guest.status].label}
                      </Badge>
                    </td>

                    <td className={tdClass}>
                      <RowActions
                        actions={[
                          {
                            label: isOperating ? 'Menghubungkan...' : 'Kirim via WhatsApp',
                            icon: isOperating ? (
                              <Loader2 size={14} className="animate-spin text-emerald-600" />
                            ) : (
                              <MessageCircle size={14} className="text-emerald-600" />
                            ),
                            onClick: () => {
                              void handleShareWhatsApp(guest)
                            },
                          },
                          {
                            label: copiedId === guest.id ? 'Tersalin!' : 'Salin Nomor HP',
                            icon:
                              copiedId === guest.id ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <Copy size={14} />
                              ),
                            onClick: () => {
                              if (guest.phone) void handleCopyPhone(guest.id, guest.phone)
                            },
                          },
                          // Hanya tamu yang sudah merespons punya baris RSVP untuk dihapus
                          ...(guest.rsvpId
                            ? [
                                {
                                  label: 'Hapus Data RSVP',
                                  icon: <Trash2 size={14} />,
                                  onClick: () => setDeletingGuest(guest),
                                  isDanger: true,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableCard>
      </QueryState>

      {/* Modal Pop-up Status Notifikasi Hasil Kirim (WhatsApp error, dsb) */}
      <Modal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
        maxWidth="sm"
      >
        <div className="py-2 text-center space-y-4">
          <AnimatedStatusIcon status={popupState.status} size="md" />

          <div>
            <h3 className="font-display text-base font-bold text-ink">
              {popupState.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              {popupState.message}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant={popupState.status === 'success' ? 'primary' : 'outline'}
              className="w-full"
              size="sm"
              onClick={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
            >
              {popupState.status === 'success' ? 'Selesai' : 'Tutup'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Data RSVP */}
      <Modal
        isOpen={deletingGuest !== null}
        onClose={() => setDeletingGuest(null)}
        title="Hapus Data Konfirmasi?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Hapus konfirmasi kehadiran dan ucapan dari{' '}
            <strong>"{deletingGuest?.name}"</strong>? Data tamu tidak ikut terhapus &mdash;
            statusnya akan kembali menjadi <strong>Belum Konfirmasi</strong> dan tamu bisa
            mengisi ulang formulir RSVP.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingGuest(null)}
              disabled={isMutating}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void handleConfirmDelete()}
              disabled={isMutating}
            >
              {isMutating ? 'Menghapus…' : 'Ya, Hapus RSVP'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
