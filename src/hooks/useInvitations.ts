import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiInvitation } from '@/types/invitation-api'
import type { InvitationSummary } from '@/types/dashboard'

/**
 * Custom React Hook untuk mengambil daftar undangan milik pengguna
 * langsung dari endpoint GET /invitations.
 *
 * Catatan: Endpoint ini mengembalikan data `ApiInvitation` yang
 * di-*map* menjadi format `InvitationSummary` agar dapat digunakan
 * oleh komponen `InvitationList`. Beberapa metrik diset ke 0 karena
 * tidak disertakan di endpoint ini.
 */
export function useInvitations() {
  const query = useQuery({
    queryKey: ['invitations'],
    queryFn: () => fetchData<ApiInvitation[]>('/invitations'),
  })

  const rawData: ApiInvitation[] = query.data ?? []

  const invitations: InvitationSummary[] = rawData.map((item: ApiInvitation) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    coupleName: item.title,
    eventDate: item.eventDate ? item.eventDate.slice(0, 10) : null,
    eventTime: item.eventTime,
    thumbnailUrl: null, // Tidak dikirim oleh GET /invitations
    status: item.status,
    guestCount: 0, // Tidak dikirim oleh GET /invitations
    checkedInCount: 0, // Tidak dikirim oleh GET /invitations
  }))

  return {
    invitations,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}