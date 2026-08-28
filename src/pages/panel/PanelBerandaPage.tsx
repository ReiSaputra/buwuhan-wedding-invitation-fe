import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { PanelHeader } from '@/components/panel/PanelHeader'
import { ScanQrCta } from '@/components/panel/ScanQrCta'
import { ActivityLogList } from '@/components/panel/ActivityLogList'
import { QuickActionCard } from '@/components/panel/QuickActionCard'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { formatNumber, formatRupiah } from '@/lib/format'
import {
  BookUser,
  ClipboardCheck,
  Gift,
  Users,
  LayoutTemplate,
  Wallet,
  CheckCircle2,
} from 'lucide-react'

/**
 * Halaman Beranda Panel Pengelolaan Undangan Spesifik.
 * Menampilkan ringkasan status undangan, progress kehadiran, log aktivitas tamu,
 * jalan pintas cepat ke fitur-fitur panel, serta CTA Scan QR resepsi.
 */
export default function PanelBerandaPage() {
  const { id = '' } = useParams()
  const { invitation, activities } = useInvitationDetail(id)
  const base = `/dashboard/undangan/${id}`

  const rsvpPercent =
    invitation.guestCount > 0
      ? Math.round((invitation.confirmedCount / invitation.guestCount) * 100)
      : 0

  const quickActions = [
    { label: 'Buku Tamu', to: `${base}/buku-tamu`, icon: <BookUser size={16} />, value: `${formatNumber(invitation.guestCount)} Tamu` },
    { label: 'Konfirmasi Kehadiran', to: `${base}/rsvp`, icon: <ClipboardCheck size={16} />, value: `${rsvpPercent}% Hadir` },
    { label: 'Amplop & Hadiah', to: `${base}/hadiah`, icon: <Gift size={16} />, value: 'Aktif' },

    { label: 'Petugas Penerima', to: `${base}/petugas`, icon: <Users size={16} />, value: '3 Akun' },
    { label: 'Desain Template', to: `${base}/template`, icon: <LayoutTemplate size={16} />, value: 'Custom' },
    { label: 'Catatan Buwuh', to: `${base}/catatan-buwuh`, icon: <Wallet size={16} />, value: formatRupiah(invitation.buwuhTotal) },
  ]

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
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                Live Aktif
              </span>
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
            value={formatRupiah(invitation.buwuhTotal)}
            hint="Tercatat dari QRIS & Transfer"
          />
        </aside>
      </div>
    </div>
  )
}