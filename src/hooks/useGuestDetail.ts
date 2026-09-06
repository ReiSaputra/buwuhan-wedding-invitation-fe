import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiGuestItem } from '@/types/invitation-api'

/**
 * Custom React Hook untuk mengambil detail satu tamu
 * (GET /invitations/:invitationId/guests/:id).
 *
 * Dipakai oleh modal detail Buku Tamu supaya data QR, pax aktual, dan jam
 * check-in/check-out selalu segar tanpa perlu memuat ulang seluruh daftar tamu.
 * Backend memvalidasi kepemilikan undangan; ID tamu asing menghasilkan 404
 * "Data tamu tidak ditemukan".
 *
 * @param invitationId - ID undangan induk
 * @param guestId - ID tamu; null membuat query tidak dijalankan
 */
export function useGuestDetail(invitationId: string, guestId: string | null) {
  const query = useQuery({
    queryKey: ['invitation', invitationId, 'guests', guestId],
    queryFn: () =>
      fetchData<ApiGuestItem>(`/invitations/${invitationId}/guests/${guestId}`),
    enabled: Boolean(invitationId && guestId),
    retry: false, // 404 tidak perlu diulang
  })

  return {
    guest: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}