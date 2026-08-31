import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { DashboardApiData, ApiDashboardInvitationItem } from '@/types/invitation-api'
import type { InvitationSummary, DashboardStats } from '@/types/dashboard'

/**
 * Menerjemahkan satu item undangan dari bentuk backend ke bentuk yang dipakai UI.
 *
 * Catatan: endpoint /dashboard TIDAK mengirim data pengantin (couples),
 * jadi `coupleName` diisi dari `title` undangan.
 */
function toInvitationSummary(item: ApiDashboardInvitationItem): InvitationSummary {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    coupleName: item.title,
    // eventDate dari backend berbentuk ISO penuh ("2026-01-18T00:00:00.000Z"),
    // UI hanya butuh bagian tanggalnya.
    eventDate: item.eventDate ? item.eventDate.slice(0, 10) : null,
    eventTime: item.eventTime,
    thumbnailUrl: item.templateThumbnail,
    status: item.status,
    guestCount: item.totalGuests,
    checkedInCount: item.totalCheckedIn,
  }
}

/**
 * Custom React Hook untuk mengambil seluruh data dashboard pengguna
 * dari endpoint GET /dashboard (statistik + daftar undangan + info paket).
 */
export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchData<DashboardApiData>('/dashboard'),
  })

  const invitations: InvitationSummary[] = (query.data?.invitations ?? []).map(
    toInvitationSummary,
  )

  const stats: DashboardStats = {
    totalInvitations: query.data?.stats.totalInvitations ?? 0,
    totalGuests: query.data?.stats.totalGuests ?? 0,
    totalCheckedIn: query.data?.stats.totalCheckedIn ?? 0,
  }

  return {
    invitations,
    stats,
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}