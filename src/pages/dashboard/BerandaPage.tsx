import { Mail, Users, QrCode, HeartHandshake } from 'lucide-react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { InvitationList } from '@/components/dashboard/InvitationList'
import { Button } from '@/components/ui/Button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDashboard } from '@/hooks/useDashboard'
import { formatNumber } from '@/lib/format'

/**
 * Halaman utama Beranda Dashboard Buwuh Panel.
 * Menampilkan ringkasan metrik acara pernikahan, banner sambutan personal,
 * dan daftar panel website undangan yang dikelola pengguna.
 */
export default function BerandaPage() {
  const user = useCurrentUser()
  const { invitations, stats, isLoading, isError } = useDashboard()

  // Undangan pertama yang berstatus aktif — dipakai untuk tombol Preview.
  const previewTarget = invitations.find((item) => item.status === 'ACTIVE') ?? invitations[0]

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda' }]} />

      {/* Hero Welcome Banner */}
      <div className="hero-gradient relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        {/* Ornamen Latar Belakang */}
        <div className="pointer-events-none absolute -right-12 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute right-24 -top-12 h-40 w-40 rounded-full bg-pink-400/20 blur-lg" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Halo, {user.nickname || user.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Senang melihat Anda kembali. Pantau konfirmasi kehadiran tamu, buku ucapan, dan amplop digital buwuh secara real-time dari satu tempat.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="bg-white/15 text-white border-white/25 hover:bg-white/25 backdrop-blur-xs shadow-none disabled:opacity-50"
              icon={<HeartHandshake size={16} />}
              disabled={!previewTarget}
              title={previewTarget ? undefined : 'Buat undangan terlebih dahulu'}
              onClick={() => {
                if (previewTarget) {
                  window.open(`/undangan/${previewTarget.slug}`, '_blank')
                }
              }}
            >
              Preview Undangan
            </Button>
          </div>
        </div>
      </div>

      {/* Metrik Statistik Kunci */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Ikhtisar Statistik
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Undangan"
            value={stats.totalInvitations}
            icon={<Mail size={18} />}
            hint={
              stats.totalInvitations === 0
                ? 'Belum ada undangan dibuat'
                : `${stats.totalInvitations} undangan tersimpan`
            }
            colorAccent="indigo"
          />
          <StatCard
            label="Total Tamu Diundang"
            value={formatNumber(stats.totalGuests)}
            icon={<Users size={18} />}
            hint="Dari seluruh daftar undangan"
            colorAccent="violet"
          />
          <StatCard
            label="Tamu Sudah Check-in"
            value={formatNumber(stats.totalCheckedIn)}
            icon={<QrCode size={18} />}
            hint={
              stats.totalGuests > 0
                ? `${Math.round((stats.totalCheckedIn / stats.totalGuests) * 100)}% tingkat kehadiran tercatat`
                : 'Belum ada tamu terdaftar'
            }
            colorAccent="emerald"
          />
        </div>
      </div>

      {/* Daftar Undangan Website */}
      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">Gagal memuat data dashboard</p>
          <p className="mt-1 text-xs text-red-600">
            Periksa apakah server backend sudah berjalan, lalu muat ulang halaman.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-border bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <InvitationList title="Panel Website Undangan" invitations={invitations} />
      )}
    </div>
  )
}