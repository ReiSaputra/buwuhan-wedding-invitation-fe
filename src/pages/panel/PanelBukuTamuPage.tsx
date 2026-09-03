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
  MessageCircle,
  Mail,
  Send,
  Loader2,
  AlertTriangle,
  MailCheck,
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
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useGuestBook } from '@/hooks/useGuestBook'
import { useGuestActions } from '@/hooks/useGuestActions'
import { useTableState } from '@/hooks/useTableState'
import { downloadCsv } from '@/lib/export'
import { formatDateId, formatNumber, formatTimeWib, getInitial } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import type { AttendanceStatus, GuestBookEntry, NewGuestInput } from '@/types/panel'
import type { BulkSendEmailResponse } from '@/types/invitation-api'
import { QueryState } from '@/components/common/QueryState'

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
 * waktu check-in, kategori tamu, dan fitur kirim undangan via WhatsApp & Email (Single & Bulk).
 */
export default function PanelBukuTamuPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { entries, stats, addGuest, updateGuest, removeGuest, isLoading, isError, isMutating } =
    useGuestBook(id)
  const { getGuestShareData, sendEmail, sendEmailBulk, isSendingEmailBulk } = useGuestActions(id)

  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GuestBookEntry | null>(null)
  const [viewedMessage, setViewedMessage] = useState<GuestBookEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<GuestBookEntry | null>(null)
  const [activeGuestActionId, setActiveGuestActionId] = useState<string | null>(null)

  // State untuk modal konfirmasi bulk email
  const [isBulkEmailConfirmOpen, setIsBulkEmailConfirmOpen] = useState(false)
  // State untuk modal hasil laporan pengiriman bulk email
  const [bulkResult, setBulkResult] = useState<BulkSendEmailResponse | null>(null)

  // State untuk modal input email jika tamu belum punya email
  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean
    guestId: string
    guestName: string
    guestCategory: string
    guestPhone?: string
    emailInput: string
  }>({
    isOpen: false,
    guestId: '',
    guestName: '',
    guestCategory: '',
    guestPhone: '',
    emailInput: '',
  })

  // State pop-up status
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
    (entry: GuestBookEntry) => `${entry.name} ${entry.category} ${entry.phone ?? ''} ${entry.email ?? ''}`,
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
  const guestsWithEmail = entries.filter((e) => Boolean(e.email?.trim()))

  function handleFormSubmit(input: NewGuestInput) {
    if (editingEntry) {
      updateGuest(editingEntry.id, input)
    } else {
      addGuest(input)
    }
    setEditingEntry(null)
  }

  function handleEdit(entry: GuestBookEntry) {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  function handlePromptDelete(entry: GuestBookEntry) {
    setDeletingEntry(entry)
  }

  function handleConfirmDelete() {
    if (deletingEntry) {
      removeGuest(deletingEntry.id)
      setDeletingEntry(null)
    }
  }

  /**
   * Berbagi undangan via WhatsApp
   */
  async function handleShareWhatsApp(entry: GuestBookEntry) {
    setActiveGuestActionId(entry.id)
    try {
      const shareData = await getGuestShareData(entry.id)
      const targetUrl = shareData.whatsappShareUrl || shareData.whatsappUniversalShareUrl
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noreferrer')
      } else {
        setPopupState({
          isOpen: true,
          status: 'error',
          title: 'Gagal Membuka WhatsApp',
          message: 'Tautan WhatsApp tidak dapat dibuat. Pastikan data tamu valid.',
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
   * Mengirim undangan ke email satu tamu (Single Send Email)
   * Menangani respon 200 OK, 422 Unprocessable Entity, 502 Bad Gateway (SMTP), 404 Not Found.
   */
  async function handleSendEmail(entry: GuestBookEntry) {
    if (!entry.email) {
      setEmailModalState({
        isOpen: true,
        guestId: entry.id,
        guestName: entry.name,
        guestCategory: entry.category,
        guestPhone: entry.phone,
        emailInput: '',
      })
      return
    }

    setActiveGuestActionId(entry.id)
    try {
      const res = await sendEmail(entry.id)
      setPopupState({
        isOpen: true,
        status: 'success',
        title: 'Undangan Email Terkirim',
        message: res.email
          ? `Undangan berhasil dikirim ke email ${res.email}`
          : 'Undangan berhasil dikirim ke email tamu',
      })
    } catch (error) {
      const parsed = parseApiError(error)

      // 422: Tamu belum memiliki alamat email yang terdaftar
      if (parsed.status === 422) {
        setEmailModalState({
          isOpen: true,
          guestId: entry.id,
          guestName: entry.name,
          guestCategory: entry.category,
          guestPhone: entry.phone,
          emailInput: '',
        })
        return
      }

      // 502: Bad Gateway (Gagal SMTP / email invalid / server mail bermasalah)
      // 404: Tamu tidak ditemukan
      setPopupState({
        isOpen: true,
        status: 'error',
        title: parsed.status === 502 ? 'Gagal Mengirim Email (SMTP)' : 'Gagal Mengirim Email',
        message:
          parsed.generalMessage ||
          'Gagal mengirim email undangan. Pastikan alamat email tamu valid atau coba beberapa saat lagi.',
      })
    } finally {
      setActiveGuestActionId(null)
    }
  }

  async function handleEmailModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = emailModalState.emailInput.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Masukkan format alamat email yang valid')
      return
    }

    const { guestId, guestName, guestCategory, guestPhone } = emailModalState
    setEmailModalState((prev) => ({ ...prev, isOpen: false }))
    setActiveGuestActionId(guestId)

    try {
      updateGuest(guestId, {
        name: guestName,
        category: guestCategory,
        phone: guestPhone || undefined,
        email,
      })

      const res = await sendEmail(guestId)
      setPopupState({
        isOpen: true,
        status: 'success',
        title: 'Undangan Email Terkirim',
        message: `Email tamu berhasil disimpan dan undangan telah dikirimkan ke ${res.email || email}.`,
      })
    } catch (error) {
      const parsed = parseApiError(error)
      setPopupState({
        isOpen: true,
        status: 'error',
        title: parsed.status === 502 ? 'Gagal Mengirim Email (SMTP)' : 'Gagal Mengirim Email',
        message:
          parsed.generalMessage ||
          'Gagal mengirim email undangan. Pastikan alamat email tamu valid atau coba beberapa saat lagi.',
      })
    } finally {
      setActiveGuestActionId(null)
    }
  }

  /**
   * Menjalankan pengiriman email massal ke seluruh tamu (Bulk Send Email)
   */
  async function handleExecuteBulkEmail() {
    setIsBulkEmailConfirmOpen(false)
    try {
      const res = await sendEmailBulk()
      setBulkResult(res)
    } catch (error) {
      const parsed = parseApiError(error)
      setPopupState({
        isOpen: true,
        status: 'error',
        title: 'Gagal Memproses Broadcast Email',
        message:
          parsed.generalMessage ||
          'Terjadi kesalahan saat memproses pengiriman email massal. Silakan coba lagi.',
      })
    }
  }

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
        Email: entry.email ?? '',
        Ucapan: entry.message ?? '',
      })),
    )
  }

  const failedBulkResults = bulkResult ? bulkResult.results.filter((r) => !r.success) : []

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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={
                isSendingEmailBulk ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : (
                  <MailCheck size={14} className="text-primary" />
                )
              }
              onClick={() => setIsBulkEmailConfirmOpen(true)}
              disabled={isSendingEmailBulk || entries.length === 0}
              title="Kirim email undangan massal ke seluruh tamu"
            >
              {isSendingEmailBulk ? 'Mengirim...' : 'Broadcast Email'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingEntry(null)
                setIsFormOpen(true)
              }}
            >
              Tambah Tamu
            </Button>
          </div>
        }
      />

      {/* Kartu Ringkasan Metrik Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tamu Tercatat"
          value={formatNumber(stats.total)}
          icon={<UsersRound size={18} />}
          colorAccent="indigo"
          hint="Daftar buku tamu keseluruhan"
        />
        <StatCard
          label="Tamu Hadir di Lokasi"
          value={formatNumber(stats.hadir)}
          icon={<CheckCircle2 size={18} />}
          variant="filled"
          hint={`${hadirPercentage}% dari total data`}
        />
        <StatCard
          label="Belum Hadir"
          value={formatNumber(stats.tidakHadir)}
          icon={<XCircle size={18} />}
          colorAccent="amber"
          hint="Belum melakukan check-in"
        />
        <StatCard
          label="Buku Ucapan & Doa"
          value={formatNumber(withMessageCount)}
          icon={<MessageSquareQuote size={18} />}
          colorAccent="violet"
          hint="Pesan restu dari tamu"
        />
      </div>

      {/* Tabel Data Buku Tamu */}
      <QueryState
        isLoading={isLoading}
        isError={isError}
      >
        <TableCard
          title="Catatan Kehadiran & Tamu"
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Cari nama, kontak, email..."
                value={table.query}
                onChange={table.setQuery}
                className="w-full sm:w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | 'ALL')}
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
                <th className={thClass}>Kategori</th>
                <th className={thClass}>Status Kehadiran</th>
                <th className={thClass}>Waktu Check-In</th>
                <th className={`${thClass} text-right`}>Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    <div className="mx-auto max-w-xs space-y-2">
                      <UsersRound size={28} className="mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada tamu ditemukan</p>
                      <p className="text-[11px] text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau tambah tamu baru.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {table.pageRows.map((entry) => {
                const isOperating = activeGuestActionId === entry.id
                return (
                  <tr key={entry.id} className="transition hover:bg-slate-50/70">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-primary border border-indigo-100/80">
                          {getInitial(entry.name)}
                        </div>
                        <div>
                          <span className="font-bold text-ink block text-xs">{entry.name}</span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            {entry.phone && <span>{entry.phone}</span>}
                            {entry.phone && entry.email && <span>•</span>}
                            {entry.email && (
                              <span className="text-primary truncate max-w-[140px]" title={entry.email}>
                                {entry.email}
                              </span>
                            )}
                            {!entry.phone && !entry.email && <span>ID: {entry.id}</span>}
                          </div>
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
                        {entry.status === 'HADIR' ? 'Hadir di Lokasi' : 'Belum Hadir'}
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
                        {/* Tombol Kirim WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(entry)}
                          disabled={isOperating}
                          className={`${iconButtonClass} hover:text-emerald-600 hover:bg-emerald-50`}
                          aria-label={`Kirim WhatsApp ke ${entry.name}`}
                          title="Kirim Undangan via WhatsApp"
                        >
                          {isOperating ? <Loader2 size={15} className="animate-spin text-emerald-600" /> : <MessageCircle size={15} className="text-emerald-600" />}
                        </button>

                        {/* Tombol Kirim Email */}
                        <button
                          type="button"
                          onClick={() => handleSendEmail(entry)}
                          disabled={isOperating}
                          className={`${iconButtonClass} hover:text-indigo-600 hover:bg-indigo-50`}
                          aria-label={`Kirim Email ke ${entry.name}`}
                          title={entry.email ? `Kirim ke ${entry.email}` : 'Lengkapi email & kirim'}
                        >
                          <Mail size={15} className="text-indigo-600" />
                        </button>

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
                )
              })}
            </tbody>
          </table>
        </TableCard>
      </QueryState>

      {/* Formulir Modal Tambah dan Ubah Tamu */}
      <GuestFormModal
        key={`${isFormOpen}-${editingEntry?.id ?? 'tamu-baru'}`}
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
                email: editingEntry.email,
                note: editingEntry.message,
              }
            : null
        }
      />

      {/* Modal Input Email Tamu (Untuk status 422 atau saat email belum ada) */}
      <Modal
        isOpen={emailModalState.isOpen}
        onClose={() => setEmailModalState((prev) => ({ ...prev, isOpen: false }))}
        title="Lengkapi Alamat Email Tamu"
        description={`Tamu "${emailModalState.guestName}" belum memiliki alamat email yang terdaftar.`}
        maxWidth="sm"
      >
        <form onSubmit={handleEmailModalSubmit} className="space-y-4">
          <div>
            <label htmlFor="buku-guest-email" className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Email Tamu
            </label>
            <input
              id="buku-guest-email"
              type="email"
              required
              value={emailModalState.emailInput}
              onChange={(e) =>
                setEmailModalState((prev) => ({ ...prev, emailInput: e.target.value }))
              }
              placeholder="Contoh: nama.tamu@gmail.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-muted">
              Alamat email akan disimpan ke profil tamu lalu sistem langsung mengirimkan undangan resmi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEmailModalState((prev) => ({ ...prev, isOpen: false }))}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Send size={13} />}>
              Simpan &amp; Kirim Email
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Broadcast Email Massal */}
      <Modal
        isOpen={isBulkEmailConfirmOpen}
        onClose={() => setIsBulkEmailConfirmOpen(false)}
        title="Kirim Email Undangan Massal"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-indigo-50/60 p-4 text-xs text-slate-700 space-y-2 border border-indigo-100">
            <div className="flex items-center justify-between font-bold">
              <span>Total Tamu Terdaftar:</span>
              <span>{entries.length} Orang</span>
            </div>
            <div className="flex items-center justify-between font-bold text-primary">
              <span>Tamu Memiliki Email:</span>
              <span>{guestsWithEmail.length} Orang</span>
            </div>
            <p className="text-[11px] text-muted pt-1 border-t border-indigo-100">
              Sistem akan mengirimkan email undangan secara otomatis ke seluruh tamu yang memiliki alamat email terdaftar.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkEmailConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Send size={13} />}
              onClick={handleExecuteBulkEmail}
              disabled={isSendingEmailBulk || guestsWithEmail.length === 0}
            >
              {isSendingEmailBulk ? 'Memproses...' : 'Mulai Broadcast Email'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Laporan Hasil Bulk Send Email */}
      <Modal
        isOpen={bulkResult !== null}
        onClose={() => setBulkResult(null)}
        title="Laporan Broadcast Email"
        maxWidth="md"
      >
        {bulkResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[10px] text-muted block font-bold uppercase">Target</span>
                <span className="font-display text-base font-bold text-ink">
                  {bulkResult.totalTargeted}
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <span className="text-[10px] text-emerald-600 block font-bold uppercase">Berhasil</span>
                <span className="font-display text-base font-bold text-emerald-600">
                  {bulkResult.totalSent}
                </span>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-3">
                <span className="text-[10px] text-danger block font-bold uppercase">Gagal</span>
                <span className="font-display text-base font-bold text-danger">
                  {bulkResult.totalFailed}
                </span>
              </div>
            </div>

            {failedBulkResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-danger">
                  <AlertTriangle size={14} />
                  <span>Daftar Email Tamu yang Gagal Terkirim:</span>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-red-100 bg-red-50/40 p-3 space-y-2 text-xs">
                  {failedBulkResults.map((item) => (
                    <div key={item.guestId} className="border-b border-red-100/60 pb-1.5 last:border-b-0">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{item.guestName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{item.email}</span>
                      </div>
                      {item.error && (
                        <p className="text-[11px] text-danger mt-0.5">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkResult.totalFailed === 0 && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-center space-y-1 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700">
                  Seluruh email undangan ({bulkResult.totalSent}) berhasil dikirimkan ke tamu.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setBulkResult(null)}>
                Tutup Laporan
              </Button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* Modal Pop-up Status Notifikasi Hasil Kirim (Single Send) */}
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
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isMutating}
            >
              {isMutating ? 'Menghapus…' : 'Ya, Hapus Tamu'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
