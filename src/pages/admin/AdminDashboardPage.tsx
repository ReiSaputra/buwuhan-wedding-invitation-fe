import { Link } from 'react-router-dom'
import {
  Users,
  Mail,
  UsersRound,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutTemplate,
  PieChart,
  Layers,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { QueryState } from '@/components/common/QueryState'
import { TableCard } from '@/components/ui/TableCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAdminStats } from '@/hooks/useAdmin'
import { formatNumber } from '@/lib/format'

/**
 * Halaman Ringkasan Dashboard Superadmin (AdminDashboardPage).
 * Menampilkan metrik KPI platform (Users, Invitations, Guests, RSVPs),
 * grafik distribusi status & kategori, serta Top 5 Template paling populer.
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminStats()

  const totalUsers = stats?.users.total ?? 0
  const totalInvitations = stats?.invitations.total ?? 0
  const totalGuests = stats?.guests.totalGuests ?? stats?.guests.total ?? 0
  const totalRsvps = stats?.guests.totalRsvps ?? stats?.rsvps?.total ?? 0

  // Perhitungan persentase status undangan
  const activeInvitations = stats?.invitations.byStatus?.ACTIVE ?? 0
  const draftInvitations = stats?.invitations.byStatus?.DRAFT ?? 0
  const completedInvitations = stats?.invitations.byStatus?.COMPLETED ?? 0

  const activePercent = totalInvitations > 0 ? Math.round((activeInvitations / totalInvitations) * 100) : 0
  const draftPercent = totalInvitations > 0 ? Math.round((draftInvitations / totalInvitations) * 100) : 0
  const completedPercent = totalInvitations > 0 ? Math.round((completedInvitations / totalInvitations) * 100) : 0

  // Perhitungan kategori acara
  const categoryWedding = stats?.invitations.byCategory?.WEDDING ?? 0
  const categoryKhitanan = stats?.invitations.byCategory?.KHITANAN ?? 0
  const categoryRasulan = stats?.invitations.byCategory?.RASULAN ?? 0
  const categoryAqiqah = stats?.invitations.byCategory?.AQIQAH ?? 0

  // Perhitungan pengguna by tier
  const freeUsers = stats?.users.byTier?.FREE ?? 0
  const proUsers = stats?.users.byTier?.PRO ?? 0
  const maxUsers = stats?.users.byTier?.MAX ?? 0

  // RSVP status
  const confirmedRsvps = stats?.guests.byRsvpStatus?.CONFIRMED ?? stats?.rsvps?.confirmed ?? 0
  const declinedRsvps = stats?.guests.byRsvpStatus?.DECLINED ?? stats?.rsvps?.declined ?? 0

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Ringkasan Platform
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-primary">
              <ShieldCheck size={12} /> Live
            </span>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Pantau pertumbuhan pengguna, volume undangan aktif, dan performa template secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Segarkan Data
          </Button>
          <Link to="/admin/invitations">
            <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
              Kelola Undangan
            </Button>
          </Link>
        </div>
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        {stats && (
          <>
            {/* Kartu Metrik KPI Utama */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Pengguna Terdaftar"
                value={formatNumber(totalUsers)}
                icon={<Users size={20} />}
                colorAccent="indigo"
                hint={`${stats.users.byRole?.USER ?? 0} Pengguna • ${stats.users.byRole?.ADMIN ?? 0} Admin`}
              />
              <StatCard
                label="Total Undangan Dibuat"
                value={formatNumber(totalInvitations)}
                icon={<Mail size={20} />}
                colorAccent="violet"
                hint={`${activeInvitations} Aktif • ${draftInvitations} Draft`}
              />
              <StatCard
                label="Total Tamu Tercatat"
                value={formatNumber(totalGuests)}
                icon={<UsersRound size={20} />}
                colorAccent="emerald"
                hint={`${stats.guests.totalCheckedIn ?? stats.guests.attended ?? 0} Hadir di Lokasi (Check-In)`}
              />
              <StatCard
                label="Total Konfirmasi Kehadiran"
                value={formatNumber(totalRsvps)}
                icon={<CheckCircle2 size={20} />}
                colorAccent="amber"
                hint={`${confirmedRsvps} Pasti Hadir • ${declinedRsvps} Berhalangan`}
              />
            </div>

            {/* Visual Breakdown Cards (Distribusi Status & Kategori) */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Card 1: Distribusi Status Undangan */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                      <PieChart size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Status Undangan</h3>
                      <p className="text-[11px] text-muted">Sebaran siklus hidup acara</p>
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-primary">{totalInvitations} Total</span>
                </div>

                {/* Progress Bar Gabungan */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex gap-0.5 p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${activePercent}%` }}
                    title={`Aktif: ${activePercent}%`}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${draftPercent}%` }}
                    title={`Draft: ${draftPercent}%`}
                  />
                  <div
                    className="h-full bg-slate-400 rounded-r-full transition-all duration-500"
                    style={{ width: `${completedPercent}%` }}
                    title={`Selesai: ${completedPercent}%`}
                  />
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-700">Aktif (Tayang Publik)</span>
                    </div>
                    <span className="font-bold text-slate-900">{activeInvitations} ({activePercent}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="font-medium text-slate-700">Draft (Dalam Edit)</span>
                    </div>
                    <span className="font-bold text-slate-900">{draftInvitations} ({draftPercent}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      <span className="font-medium text-slate-700">Selesai (Completed)</span>
                    </div>
                    <span className="font-bold text-slate-900">{completedInvitations} ({completedPercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Kategori Acara */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Kategori Acara</h3>
                      <p className="text-[11px] text-muted">Variasi jenis hajatan</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Pernikahan (Wedding)</span>
                      <span className="font-bold text-ink">{categoryWedding}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: totalInvitations > 0 ? `${(categoryWedding / totalInvitations) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Khitanan</span>
                      <span className="font-bold text-ink">{categoryKhitanan}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: totalInvitations > 0 ? `${(categoryKhitanan / totalInvitations) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Rasulan</span>
                      <span className="font-bold text-ink">{categoryRasulan}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: totalInvitations > 0 ? `${(categoryRasulan / totalInvitations) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Aqiqah</span>
                      <span className="font-bold text-ink">{categoryAqiqah}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: totalInvitations > 0 ? `${(categoryAqiqah / totalInvitations) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Distribusi Paket Langganan */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Paket Pengguna</h3>
                      <p className="text-[11px] text-muted">Klasifikasi tier langganan</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Free
                    </span>
                    <span className="font-display text-xl font-bold text-slate-800">{freeUsers}</span>
                    <span className="text-[10px] text-muted block">Pengguna</span>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                      Pro
                    </span>
                    <span className="font-display text-xl font-bold text-emerald-700">{proUsers}</span>
                    <span className="text-[10px] text-emerald-600 block">Premium</span>
                  </div>

                  <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                      Max
                    </span>
                    <span className="font-display text-xl font-bold text-purple-700">{maxUsers}</span>
                    <span className="text-[10px] text-purple-600 block">Enterprise</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-50/60 p-3.5 border border-indigo-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Tingkat Konversi Berbayar</span>
                  <span className="font-bold text-primary">
                    {totalUsers > 0 ? Math.round(((proUsers + maxUsers) / totalUsers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tabel Top 5 Template Terpopuler */}
            <TableCard
              title="Top Template Terpopuler"
              toolbar={
                <Link to="/admin/templates">
                  <Button variant="outline" size="sm" icon={<LayoutTemplate size={14} />}>
                    Kelola Semua Template
                  </Button>
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Peringkat</th>
                      <th className="px-6 py-3.5">Desain &amp; Nama Template</th>
                      <th className="px-6 py-3.5">Slug Template</th>
                      <th className="px-6 py-3.5">Tier Akses</th>
                      <th className="px-6 py-3.5 text-right">Frekuensi Penggunaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.topTemplates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-muted">
                          Belum ada data template terpopuler.
                        </td>
                      </tr>
                    )}
                    {stats.topTemplates.map((template, idx) => (
                      <tr key={template.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 font-bold text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {template.previewImageUrl ? (
                              <img
                                src={template.previewImageUrl}
                                alt={template.name}
                                className="h-10 w-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="h-10 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Sparkles size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{template.name}</p>
                              <p className="text-[10px] text-muted font-mono">{template.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                          {template.slug}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={template.tier === 'MAX' ? 'primary' : template.tier === 'PRO' ? 'success' : 'default'}>
                            {template.tier || 'FREE'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1 font-bold text-primary border border-indigo-100 text-xs">
                            <TrendingUp size={12} />
                            {template.usageCount} Undangan
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableCard>
          </>
        )}
      </QueryState>
    </div>
  )
}
