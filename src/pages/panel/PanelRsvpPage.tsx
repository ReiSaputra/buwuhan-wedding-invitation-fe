import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  MoreHorizontal,
  UsersRound,
  XCircle,
  Sparkles,
  Phone,
  Check,
  Mail,
  Send,
  Loader2,
  AlertTriangle,
  MailCheck,
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
import { useGuestBook } from '@/hooks/useGuestBook'
import { useTableState } from '@/hooks/useTableState'
import { formatNumber, getInitial } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import type { RsvpGuest, RsvpStatus } from '@/types/panel'
import type { BulkSendEmailResponse } from '@/types/invitation-api'

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
 * tabel pencarian tamu, filter status, dan fitur kirim undangan via WhatsApp & Email (Single & Bulk).
 */
export default function PanelRsvpPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { guests, stats, isLoading, isError } = useRsvpGuests(id)
  const { getGuestShareData, sendEmail, sendEmailBulk, isSendingEmailBulk } = useGuestActions(id)
  const { updateGuest } = useGuestBook(id)

  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeGuestActionId, setActiveGuestActionId] = useState<string | null>(null)

  // State untuk modal konfirmasi broadcast email
  const [isBulkEmailConfirmOpen, setIsBulkEmailConfirmOpen] = useState(false)
  // State untuk modal hasil laporan bulk email
  const [bulkResult, setBulkResult] = useState<BulkSendEmailResponse | null>(null)

  // State untuk modal input email jika tamu belum memiliki email
  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean
    guestId: string
    guestName: string
    guestCategory: string
    guestPhone: string
    emailInput: string
  }>({
    isOpen: false,
    guestId: '',
    guestName: '',
    guestCategory: '',
    guestPhone: '',
    emailInput: '',
  })

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
    (guest: RsvpGuest) => `${guest.name} ${guest.phone} ${guest.email ?? ''} ${guest.category}`,
    [],
  )

  const filterFn = useCallback(
    (guest: RsvpGuest) => statusFilter === 'ALL' || guest.status === statusFilter,
    [statusFilter],
  )

  const table = useTableState({ rows: guests, pageSize: 8, getSearchText, filterFn })

  const hadirPercentage =
    stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0

  const guestsWithEmail = guests.filter((g) => Boolean(g.email?.trim()))

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
   * Mengirim undangan ke email satu tamu (Single Send Email)
   * Menangani 200 OK, 422 Unprocessable Entity, 502 Bad Gateway (SMTP), 404 Not Found.
   */
  async function handleSendEmail(guest: RsvpGuest) {
    if (!guest.email) {
      setEmailModalState({
        isOpen: true,
        guestId: guest.id,
        guestName: guest.name,
        guestCategory: guest.category,
        guestPhone: guest.phone,
        emailInput: '',
      })
      return
    }

    setActiveGuestActionId(guest.id)
    try {
      const res = await sendEmail(guest.id)
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

      // 422: Tamu belum memiliki email
      if (parsed.status === 422) {
        setEmailModalState({
          isOpen: true,
          guestId: guest.id,
          guestName: guest.name,
          guestCategory: guest.category,
          guestPhone: guest.phone,
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

  /**
   * Menyimpan email baru ke database tamu lalu langsung mengirimkan email undangan.
   */
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
      // 1. Update data email tamu
      updateGuest(guestId, {
        name: guestName,
        category: guestCategory,
        phone: guestPhone || undefined,
        email,
      })

      // 2. Kirim undangan via email
      const res = await sendEmail(guestId)
      setPopupState({
        isOpen: true,
        status: 'success',
        title: 'Undangan Email Terkirim',
        message: `Email tamu berhasil diperbarui dan undangan digital telah dikirimkan ke ${res.email || email}.`,
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
   * Menjalankan pengiriman broadcast email massal
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

  const failedBulkResults = bulkResult ? bulkResult.results.filter((r) => !r.success) : []

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
            icon={
              isSendingEmailBulk ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <MailCheck size={14} className="text-primary" />
              )
            }
            onClick={() => setIsBulkEmailConfirmOpen(true)}
            disabled={isSendingEmailBulk || guests.length === 0}
            title="Kirim email undangan massal ke seluruh tamu"
          >
            {isSendingEmailBulk ? 'Mengirim...' : 'Broadcast Email'}
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
          hint="Perlu pengingat via WhatsApp/Email"
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
                placeholder="Cari nama, kontak, email..."
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
                      <div className="space-y-1">
                        {guest.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            <span className="tabular-nums font-mono text-xs">{guest.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">No HP: -</span>
                        )}

                        {guest.email ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Mail size={11} className="text-primary" />
                            <span className="truncate max-w-[140px]" title={guest.email}>
                              {guest.email}
                            </span>
                          </div>
                        ) : null}
                      </div>
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
                            label: 'Kirim via Email',
                            icon: <Mail size={14} className="text-indigo-600" />,
                            onClick: () => {
                              void handleSendEmail(guest)
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

      {/* Modal Input Email Tamu (Jika Tamu Belum Memiliki Email / Status 422) */}
      <Modal
        isOpen={emailModalState.isOpen}
        onClose={() => setEmailModalState((prev) => ({ ...prev, isOpen: false }))}
        title="Lengkapi Alamat Email Tamu"
        description={`Tamu "${emailModalState.guestName}" belum memiliki alamat email yang terdaftar.`}
        maxWidth="sm"
      >
        <form onSubmit={handleEmailModalSubmit} className="space-y-4">
          <div>
            <label htmlFor="input-guest-email" className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Email Tamu
            </label>
            <input
              id="input-guest-email"
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
              Alamat ini akan disimpan ke data tamu dan menerima undangan digital resmi.
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
              <span>Total Tamu Undangan:</span>
              <span>{guests.length} Orang</span>
            </div>
            <div className="flex items-center justify-between font-bold text-primary">
              <span>Tamu Memiliki Email:</span>
              <span>{guestsWithEmail.length} Orang</span>
            </div>
            <p className="text-[11px] text-muted pt-1 border-t border-indigo-100">
              Sistem akan mengirimkan undangan digital ke seluruh tamu yang telah memiliki alamat email terdaftar.
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
    </div>
  )
}
