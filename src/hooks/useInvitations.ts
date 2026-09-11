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

  const invitations: InvitationSummary[] = rawData.map((item: ApiInvitation) => {
    // Ambil foto pertama dari galeri foto, atau dari preview template, atau dari additionalInfo cover
    const coverUrl =
      item.galleryPhotos?.[0]?.imageUrl ||
      (item.additionalInfo as Record<string, unknown> | null)?.coverImageUrl as string | undefined ||
      null

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      coupleName: item.title,
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : null,
      eventTime: item.eventTime,
      thumbnailUrl: coverUrl,
      status: item.status,
      guestCount: 0,
      checkedInCount: 0,
    }
  })

  return {
    invitations,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}