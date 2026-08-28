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
} from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { RowActions } from '@/components/ui/RowActions'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useRsvpGuests } from '@/hooks/useRsvpGuests'
import { useTableState } from '@/hooks/useTableState'
import { formatNumber, getInitial } from '@/lib/format'
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

/**
 * Mengubah nomor HP lokal menjadi tautan WhatsApp web/app dengan pesan salam otomatis.
 *
 * @param phone - Nomor HP (contoh: "081234567890")
 * @param guestName - Nama tamu yang dituju
 * @param coupleName - Nama kedua mempelai
 * @returns URL wa.me yang siap dibuka di browser
 */
function toWhatsAppUrl(phone: string, guestName: string, coupleName: string): string {
  const digits = phone.replace(/\D/g, '')
  const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  const message = encodeURIComponent(
    `Halo ${guestName}, kami menantikan kehadiran Anda di acara pernikahan ${coupleName}. Jangan lupa untuk konfirmasi kehadiran Anda melalui website undangan kami ya. Terima kasih!`,
  )
  return `https://wa.me/${international}?text=${message}`
}

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/**
 * Halaman Konfirmasi Kehadiran pada Panel Pengelolaan Undangan.
 * Menampilkan ringkasan status kehadiran seluruh tamu, progres persentase hadir,
 * tabel pencarian tamu, filter status, dan jalan pintas kirim pesan WhatsApp.
 */

export default function PanelRsvpPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { guests, stats } = useRsvpGuests(id)

  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  /**
   * Menyalin nomor HP tamu ke clipboard dan memberikan notifikasi visual sesaat.
   * 
   * @param guestId - ID tamu
   * @param phone - Nomor HP tamu
   */
  async function handleCopyPhone(guestId: string, phone: string) {
    await navigator.clipboard.writeText(phone)
    setCopiedId(guestId)
    setTimeout(() => setCopiedId(null), 2000)
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
            style={{ width: `${(stats.hadir / stats.total) * 100}%` }}
            title={`Hadir: ${stats.hadir}`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${(stats.tidakHadir / stats.total) * 100}%` }}
            title={`Tidak Hadir: ${stats.tidakHadir}`}
          />
          <div
            className="h-full bg-slate-200 transition-all duration-500"
            style={{ width: `${(stats.belumKonfirmasi / stats.total) * 100}%` }}
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

      {/* Tabel Data RSVP */}
      <TableCard
        title="Daftar Konfirmasi Tamu"
        toolbar={
          <>
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari nama, HP, atau kategori..."
              className="sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as RsvpStatus | 'ALL')
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
              <th className={thClass}>Nomor WhatsApp</th>
              <th className={thClass}>Kategori</th>
              <th className={thClass}>Jumlah Pax</th>
              <th className={thClass}>Status Kehadiran</th>
              <th className={`${thClass} text-right`}>Aksi</th>
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


            {table.pageRows.map((guest) => (
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
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    <span className="tabular-nums font-mono text-xs">{guest.phone}</span>
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
                        label: copiedId === guest.id ? 'Tersalin!' : 'Salin Nomor HP',
                        icon: copiedId === guest.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />,
                        onClick: () => {
                          void handleCopyPhone(guest.id, guest.phone)
                        },
                      },
                      {
                        label: 'Hubungi WhatsApp',
                        icon: <MessageCircle size={14} className="text-emerald-600" />,
                        onClick: () => {
                          window.open(
                            toWhatsAppUrl(guest.phone, guest.name, invitation.coupleName || 'Pengantin'),
                            '_blank',
                            'noreferrer',
                          )
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  )
}

