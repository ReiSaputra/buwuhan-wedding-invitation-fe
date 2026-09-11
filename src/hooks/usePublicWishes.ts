import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData } from '@/lib/api'
import type { ApiWishItem, RsvpSubmitPayload } from '@/types/invitation-api'

/**
 * Mengubah waktu ISO menjadi teks relatif bahasa Indonesia.
 *
 * @param isoDate - Waktu ISO dari backend
 * @returns Teks seperti 'Baru saja', '10 menit yang lalu', '3 hari yang lalu'
 */
export function formatTimeAgo(isoDate: string): string {
  const target = new Date(isoDate)
  if (Number.isNaN(target.getTime())) return ''

  const seconds = Math.floor((Date.now() - target.getTime()) / 1000)

  if (seconds < 60) return 'Baru saja'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit yang lalu`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari yang lalu`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan yang lalu`

  return `${Math.floor(months / 12)} tahun yang lalu`
}

/**
 * Custom React Hook untuk mengambil daftar ucapan & doa restu tamu
 * dari endpoint publik `GET /public/invitations/:slug/wishes`.
 *
 * @param slug - Slug undangan yang sedang dibuka
 * @returns Daftar ucapan dan flag status permintaan
 */
export function usePublicWishes(slug: string, limit = 50, page = 1) {
  const query = useQuery({
    queryKey: ['public-wishes', slug, limit, page],
    queryFn: () =>
      fetchData<ApiWishItem[]>(
        `/public/invitations/${slug}/wishes?limit=${limit}&page=${page}`,
      ),
    enabled: Boolean(slug),
    staleTime: 1000 * 30,
  })

  return {
    wishes: query.data ?? [],
    isLoading: Boolean(slug) && query.isLoading,
    isError: query.isError,
  }
}

/**
 * Custom React Hook untuk mengirim konfirmasi kehadiran & ucapan tamu
 * ke endpoint publik `POST /public/invitations/:slug/rsvp`.
 * Setelah berhasil, daftar ucapan otomatis dimuat ulang.
 *
 * @param slug - Slug undangan yang sedang dibuka
 * @returns Objek mutation React Query
 */
export function useSubmitRsvp(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RsvpSubmitPayload) =>
      postData<unknown, RsvpSubmitPayload>(`/public/invitations/${slug}/rsvp`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-wishes', slug] })
    },
  })
}
