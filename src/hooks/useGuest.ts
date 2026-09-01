import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { fetchData } from '@/lib/api'
import type { ApiGuestItem } from '@/types/invitation-api'

/**
 * Custom React Hook untuk membaca kode tamu pada URL undangan (`?to=<qrCode>`),
 * memverifikasinya lewat endpoint publik backend, dan menyediakan nama tamu
 * beserta fallback bila tautan dibuka tanpa kode tamu.
 *
 * Endpoint: GET /public/invitations/:slug/guests/verify/:qrCode
 *
 * @param invitationSlug - Slug undangan. Opsional; bila tidak diisi, slug
 *   diambil otomatis dari parameter rute `/undangan/:slug`. Ini membuat hook
 *   bisa dipakai langsung di dalam komponen template tanpa prop drilling.
 * @returns Objek berisi `qrCode`, data `guest`, `guestName`, dan flag status
 *
 * @example
 * const { guestName, isLoading } = useGuest()
 */
export function useGuest(invitationSlug?: string) {
  const { slug: slugFromRoute = '' } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()

  const slug = invitationSlug ?? slugFromRoute
  const qrCode = searchParams.get('to')
  const enabled = Boolean(slug && qrCode)

  const query = useQuery({
    queryKey: ['public-guest', slug, qrCode],
    queryFn: () =>
      fetchData<ApiGuestItem>(
        `/public/invitations/${slug}/guests/verify/${encodeURIComponent(qrCode ?? '')}`,
      ),
    enabled,
    retry: false,
  })

  return {
    qrCode,
    guest: query.data ?? null,
    // Bila kode tamu tidak ada atau tidak ditemukan, pakai sapaan umum
    guestName: query.data?.name ?? 'Tamu Undangan',
    paxCount: query.data?.paxCount ?? 1,
    isLoading: enabled && query.isLoading,
    isInvalidCode: enabled && query.isError,
  }
}