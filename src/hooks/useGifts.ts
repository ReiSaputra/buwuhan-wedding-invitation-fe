import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type { GiftPayload, GiftRecord, GiftStats } from '@/types/panel'

/**
 * Hook pengelola catatan pemberian hadiah tamu (uang maupun barang) untuk satu undangan.
 *
 * Endpoint yang tersambung:
 * - GET    /invitations/:invitationId/gifts
 * - GET    /invitations/:invitationId/gifts/stats
 * - POST   /invitations/:invitationId/gifts
 * - PATCH  /gifts/:id
 * - DELETE /gifts/:id
 *
 * @param invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `gifts`, rekap `stats`, fungsi mutasi, dan status loading
 */
export function useGifts(invitationId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(invitationId)

  const listQuery = useQuery({
    queryKey: ['invitation', invitationId, 'gifts'],
    queryFn: async () => {
      try {
        const data = await fetchData<GiftRecord[]>(`/invitations/${invitationId}/gifts`)
        return data ?? []
      } catch (err) {
        console.warn('Gagal memuat catatan hadiah:', err)
        return []
      }
    },
    enabled,
  })

  const statsQuery = useQuery({
    queryKey: ['invitation', invitationId, 'gifts', 'stats'],
    queryFn: async () => {
      try {
        const data = await fetchData<GiftStats>(`/invitations/${invitationId}/gifts/stats`)
        return data
      } catch {
        return null
      }
    },
    enabled,
  })

  function invalidateAll() {
    void queryClient.invalidateQueries({
      queryKey: ['invitation', invitationId, 'gifts'],
    })
    void queryClient.invalidateQueries({
      queryKey: ['invitation', invitationId],
    })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: GiftPayload) =>
      postData<GiftRecord, GiftPayload>(`/invitations/${invitationId}/gifts`, payload),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GiftPayload> }) =>
      patchData<GiftRecord, Partial<GiftPayload>>(`/gifts/${id}`, payload),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`/gifts/${id}`),
    onSuccess: invalidateAll,
  })

  const gifts = listQuery.data ?? []

  // Hitung stats fallback jika endpoint stats belum aktif
  const stats = useMemo<GiftStats>(() => {
    if (statsQuery.data) {
      return statsQuery.data
    }
    return {
      totalAmount: gifts.reduce((sum, gift) => sum + (gift.amount ?? 0), 0),
      participantCount: new Set(gifts.map((gift) => gift.guestName)).size,
      physicalCount: gifts.filter((gift) => gift.kind === 'BARANG').length,
    }
  }, [gifts, statsQuery.data])

  return {
    gifts,
    stats,
    isLoading: listQuery.isLoading || statsQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    createGift: createMutation.mutateAsync,
    updateGift: updateMutation.mutateAsync,
    removeGift: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
