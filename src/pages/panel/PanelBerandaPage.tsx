import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { PanelHeader } from '@/components/panel/PanelHeader'
import { ScanQrCta } from '@/components/panel/ScanQrCta'
import { ActivityLogList } from '@/components/panel/ActivityLogList'
import { QuickActionCard } from '@/components/panel/QuickActionCard'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useBuwuhan } from '@/hooks/useBuwuhan'
import { useMembers } from '@/hooks/useMembers'
import { useGiftAccounts } from '@/hooks/useGiftAccounts'
import { useGuestBook } from '@/hooks/useGuestBook'
import { useRsvpGuests } from '@/hooks/useRsvpGuests'
import { calculateBuwuhStats } from '@/lib/buwuhHelper'
import { formatDateCompact, formatNumber, formatRupiah } from '@/lib/format'
import type { ActivityLog } from '@/types/dashboard'
import {
  BookUser,
  ClipboardCheck,
  Gift,
  Users,
  LayoutTemplate,
  Wallet,
  CheckCircle2,
  Archive,
  FileEdit,
} from 'lucide-react'

/**
 * Halaman Beranda Panel Pengelolaan Undangan Spesifik.
 * Menampilkan ringkasan status undangan, progress kehadiran, log aktivitas tamu,
 * jalan pintas cepat ke fitur-fitur panel, serta CTA Scan QR resepsi.
 */
export default function PanelBerandaPage() {
  const { id = '' } = useParams()
  const { invitation, rawInvitation } = useInvitationDetail(id)
  const { records: buwuhanRecords = [], summary: buwuhanSummary } = useBuwuhan(id)
  const { data: members = [] } = useMembers(id)
  const { accounts: giftAccounts = [] } = useGiftAccounts(id)
  const { entries: guestEntries = [] } = useGuestBook(id)
  const { guests: rsvpGuests = [] } = useRsvpGuests(id)

  const base = `/dashboard/undangan/${id}`

  const rsvpPercent =
    invitation.guestCount > 0
      ? Math.round((invitation.confirmedCount / invitation.guestCount) * 100)
      : 0

  const buwuhStats = useMemo(() => calculateBuwuhStats(buwuhanRecords), [buwuhanRecords])
  const totalBuwuh = useMemo(() => {
    if (buwuhStats.totalMoney > 0) return buwuhStats.totalMoney
    if (buwuhanSummary?.totalEstimatedValue && buwuhanSummary.totalEstimatedValue > 0) {
      return buwuhanSummary.totalEstimatedValue
    }
    return buwuhStats.totalEstimatedValue || invitation.buwuhTotal || 0
  }, [buwuhStats, buwuhanSummary, invitation.buwuhTotal])

  const quickActions = [
    {
      label: 'Buku Tamu',
      to: `${base}/buku-tamu`,
      icon: <BookUser size={16} />,
      value: `${formatNumber(invitation.guestCount)} Tamu`,
    },
    {
      label: 'Konfirmasi Kehadiran',
      to: `${base}/rsvp`,
      icon: <ClipboardCheck size={16} />,
      value: `${rsvpPercent}% Hadir`,
    },
    {
      label: 'Amplop & Hadiah',
      to: `${base}/hadiah`,
      icon: <Gift size={16} />,
      value:
        giftAccounts.length > 0
          ? `${giftAccounts.length} Rekening Aktif`
          : rawInvitation?.giftAddress
          ? 'Alamat Kado Aktif'
          : 'Belum diatur',
    },
    {
      label: 'Petugas Penerima',
      to: `${base}/petugas`,
      icon: <Users size={16} />,
      value: members.length > 0 ? `${members.length} Petugas` : 'Belum diatur',
    },
    {
      label: 'Desain Template',
      to: `${base}/template`,
      icon: <LayoutTemplate size={16} />,
      value: rawInvitation?.template?.name ?? 'Belum dipilih',
    },
    {
      label: 'Catatan Buwuh',
      to: `${base}/catatan-buwuh`,
      icon: <Wallet size={16} />,
      value: formatRupiah(totalBuwuh),
    },
  ]

  // Linimasa aktivitas riil gabungan dari RSVP, Catatan Buwuh, dan Check-in Tamu
  const activities: ActivityLog[] = useMemo(() => {
    const list: Array<ActivityLog & { timestamp: number }> = []

    // 1. Log dari RSVP tamu
    for (const rsvp of rsvpGuests) {
      if (rsvp.status !== 'BELUM_KONFIRMASI') {
        list.push({
          id: `rsvp-${rsvp.id}`,
          message: `${rsvp.name} mengonfirmasi ${rsvp.status === 'HADIR' ? 'Hadir' : 'Tidak Hadir'}`,
          category: 'rsvp',
          detail: rsvp.headcount ? `Jumlah tamu: ${rsvp.headcount} orang` : undefined,
          createdAt: 'Terkonfirmasi',
          timestamp: 2,
        })
      }
    }

    // 2. Log dari Catatan Buwuh
    for (const record of buwuhanRecords) {
      const itemsDesc = record.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')
      list.push({
        id: `buwuh-${record.id}`,
        message: `${record.giverName} mencatat buwuh: ${itemsDesc}`,
        category: 'hadiah',
        detail: record.note || undefined,
        createdAt: record.receivedAt ? formatDateCompact(record.receivedAt) : 'Tercatat',
        timestamp: record.receivedAt ? new Date(record.receivedAt).getTime() : 3,
      })
    }

    // 3. Log dari check-in tamu
    for (const guest of guestEntries) {
      if (guest.status === 'HADIR') {
        list.push({
          id: `checkin-${guest.id}`,
          message: `${guest.name} telah hadir (Check-in QR)`,
          category: 'rsvp',
          detail: guest.message || undefined,
          createdAt: guest.recordedAt ? formatDateCompact(guest.recordedAt) : 'Tercatat',
          timestamp: guest.recordedAt ? new Date(guest.recordedAt).getTime() : 1,
        })
      }
    }

    return list
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(({ timestamp: _, ...log }) => log)
  }, [rsvpGuests, buwuhanRecords, guestEntries])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Kolom Utama (Kiri) */}
        <div className="space-y-6">
          {/* Header Undangan Pasangan */}
          <PanelHeader
            coupleName={invitation.coupleName}
            eventDate={invitation.eventDate}
            slug={invitation.slug}
            hasTemplate={Boolean(rawInvitation?.template)}
            status={invitation.status}
          />

          {/* Bagian Jalan Pintas Fitur */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilih Fitur Cepat
              </h2>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.to}
                  label={action.label}
                  to={action.to}
                  icon={action.icon}
                  value={action.value}
                />
              ))}
            </div>
          </section>

          {/* Bagian Linimasa Log Aktivitas Tamu */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Log Interaksi & Aktivitas Tamu
              </h2>
            </div>
            <ActivityLogList logs={activities} />
          </section>
        </div>

        {/* Kolom Status & Aksi Samping (Kanan) */}
        <aside className="space-y-4">
          {/* CTA Scan QR Resepsi */}
          <ScanQrCta to={`${base}/scan-qr`} />

          {/* Kartu Progress Kehadiran */}
          <div className="rounded-3xl border border-border bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Status Acara
              </span>
              {rawInvitation?.status === 'ACTIVE' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  Live Aktif
                </span>
              ) : rawInvitation?.status === 'COMPLETED' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Archive size={12} />
                  Selesai
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <FileEdit size={12} />
                  Draft
                </span>
              )}
            </div>

            {/* Progress RSVP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Tingkat Konfirmasi Kehadiran</span>
                <span className="font-bold text-primary">{rsvpPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${rsvpPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted text-right">
                {invitation.confirmedCount} dari {invitation.guestCount} tamu telah konfirmasi
              </p>
            </div>
          </div>

          {/* Kartu Status Metrik */}
          <StatCard
            variant="filled"
            label="Total Tamu Diundang"
            value={formatNumber(invitation.guestCount)}
            hint="Kapasitas undangan terdaftar"
          />
          <StatCard
            variant="filled"
            label="Konfirmasi Tamu Hadir"
            value={formatNumber(invitation.confirmedCount)}
            hint={`${rsvpPercent}% tamu menyatakan siap hadir`}
          />
          <StatCard
            variant="gradient"
            label="Total Bantuan Buwuh Masuk"
            value={formatRupiah(totalBuwuh)}
            hint={
              buwuhanRecords.length > 0
                ? `${buwuhanRecords.length} transaksi buwuhan tercatat`
                : 'Belum ada transaksi buwuh'
            }
          />
        </aside>
      </div>
    </div>
  )
}