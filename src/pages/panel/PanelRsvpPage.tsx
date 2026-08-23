import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  MoreHorizontal,
  UsersRound,
  XCircle,
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
import { formatNumber } from '@/lib/format'
import type { RsvpGuest, RsvpStatus } from '@/types/panel'

/** Label dan warna badge untuk setiap status RSVP. */
const statusMeta: Record<RsvpStatus, { label: string; variant: BadgeVariant }> = {
  HADIR: { label: 'Hadir', variant: 'success' },
  TIDAK_HADIR: { label: 'Tidak Hadir', variant: 'default' },
  BELUM_KONFIRMASI: { label: 'Belum Konfirmasi', variant: 'outline' },
}

const filterOptions: Array<{ value: RsvpStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'HADIR', label: 'Hadir' },
  { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
  { value: 'BELUM_KONFIRMASI', label: 'Belum Konfirmasi' },
]

/**
 * Mengubah nomor HP lokal menjadi tautan WhatsApp berformat internasional.
 *
 * @param phone - Nomor HP, misal "081234567890"
 * @returns URL wa.me, misal "https://wa.me/6281234567890"
 */
function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${international}`
}

const thClass = 'px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'

/**
 * Halaman RSVP pada panel undangan.
 * Menampilkan rekap konfirmasi kehadiran dan daftar tamu yang bisa
 * dicari, disaring per status, serta dihubungi langsung via WhatsApp.
 */
export default function PanelRsvpPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { guests, stats } = useRsvpGuests(id)

  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'ALL'>('ALL')

  // useCallback dipakai agar fungsi tidak dibuat ulang setiap render,
  // sehingga useMemo di dalam useTableState tidak ikut terhitung ulang.
  const getSearchText = useCallback(
    (guest: RsvpGuest) => `${guest.name} ${guest.phone} ${guest.category}`,
    [],
  )

  const filterFn = useCallback(
    (guest: RsvpGuest) => statusFilter === 'ALL' || guest.status === statusFilter,
    [statusFilter],
  )

  const table = useTableState({ rows: guests, pageSize: 8, getSearchText, filterFn })

  /** Menyalin nomor HP tamu ke papan klip. */
  async function handleCopyPhone(phone: string) {
    await navigator.clipboard.writeText(phone)
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Undangan', to: `/dashboard/undangan/${id}` },
          { label: 'RSVP' },
        ]}
        title="RSVP"
        subtitle={`Pantau kehadiran tamu undangan ${invitation.coupleName}`}
      />

      {/* Empat kartu rekap */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tamu"
          value={formatNumber(stats.total)}
          icon={<UsersRound size={18} />}
          colorAccent="indigo"
        />
        <StatCard
          label="Hadir"
          value={formatNumber(stats.hadir)}
          icon={<CheckCircle2 size={18} />}
          variant="filled"
          hint={`${Math.round((stats.hadir / stats.total) * 100)}% dari total tamu`}
        />
        <StatCard
          label="Tidak Hadir"
          value={formatNumber(stats.tidakHadir)}
          icon={<XCircle size={18} />}
          colorAccent="amber"
        />
        <StatCard
          label="Belum Konfirmasi"
          value={formatNumber(stats.belumKonfirmasi)}
          icon={<MoreHorizontal size={18} />}
          colorAccent="violet"
          hint="Perlu diingatkan ulang"
        />
      </div>

      {/* Tabel daftar tamu */}
      <TableCard
        title="Daftar Tamu"
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
                setStatusFilter(event.target.value as RsvpStatus | 'ALL')
                table.resetPage()
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer"
              aria-label="Saring berdasarkan status RSVP"
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
              <th className={thClass}>Nama</th>
              <th className={thClass}>Nomor HP</th>
              <th className={thClass}>Kategori</th>
              <th className={thClass}>Jumlah</th>
              <th className={thClass}>Status RSVP</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {table.pageRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  Tidak ada tamu yang cocok dengan pencarian atau filter ini.
                </td>
              </tr>
            )}

            {table.pageRows.map((guest) => (
              <tr key={guest.id} className="transition hover:bg-slate-50/70">
                <td className={`${tdClass} font-bold text-ink`}>{guest.name}</td>
                <td className={`${tdClass} tabular-nums text-slate-600`}>{guest.phone}</td>
                <td className={`${tdClass} text-slate-600`}>{guest.category}</td>
                <td className={`${tdClass} text-slate-600`}>
                  {guest.headcount === null ? (
                    <span className="text-slate-300">&mdash;</span>
                  ) : (
                    `${guest.headcount} orang`
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
                        label: 'Salin Nomor HP',
                        icon: <Copy size={14} />,
                        onClick: () => {
                          void handleCopyPhone(guest.phone)
                        },
                      },
                      {
                        label: 'Hubungi WhatsApp',
                        icon: <MessageCircle size={14} />,
                        onClick: () => {
                          window.open(toWhatsAppUrl(guest.phone), '_blank', 'noreferrer')
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
