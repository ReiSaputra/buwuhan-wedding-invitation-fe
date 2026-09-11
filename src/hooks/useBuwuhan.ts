import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import { instantAuthStorage } from '@/lib/instantAuthStorage'
import type { ApiBuwuhan, ApiBuwuhanSummary, BuwuhanPayload } from '@/types/invitation-api'

const EMPTY_SUMMARY: ApiBuwuhanSummary = {
  totalItems: 0,
  totalTransactions: 0,
  totalEstimatedValue: 0,
  totalItemsThisMonth: 0,
  topItem: null,
}

/**
 * Hook pengelola Catatan Buwuh satu undangan: daftar transaksi, ringkasan
 * nilai, serta aksi tambah, ubah, dan hapus yang tersambung ke backend.
 *
 * Endpoint:
 * - GET    /invitations/:id/buwuhans
 * - GET    /invitations/:id/buwuhans/summary
 * - POST   /invitations/:id/buwuhans
 * - PATCH  /buwuhans/:buwuhanId
 * - DELETE /buwuhans/:buwuhanId
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useBuwuhan(invitationId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(invitationId)

  const listQuery = useQuery({
    queryKey: ['invitation', invitationId, 'buwuhans'],
    queryFn: async () => {
      try {
        const data = await fetchData<ApiBuwuhan[]>(`/invitations/${invitationId}/buwuhans`)
        return Array.isArray(data) ? data : []
      } catch (err) {
        console.warn('Gagal memuat catatan buwuh dari backend:', err)
        return []
      }
    },
    enabled,
    staleTime: 1000 * 15,
  })

  const summaryQuery = useQuery({
    queryKey: ['invitation', invitationId, 'buwuhan-summary'],
    queryFn: async () => {
      try {
        const data = await fetchData<ApiBuwuhanSummary>(`/invitations/${invitationId}/buwuhans/summary`)
        return data ?? EMPTY_SUMMARY
      } catch {
        return EMPTY_SUMMARY
      }
    },
    enabled,
    staleTime: 1000 * 30,
  })

  /** Menyegarkan daftar buwuh per-undangan, daftar global buwuhan, ringkasannya, dan dashboard. */
  function invalidateAll() {
    const isInstant = instantAuthStorage.isInstantAccess()

    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId, 'buwuhans'] })
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId, 'buwuhan-summary'] })
    void queryClient.refetchQueries({ queryKey: ['invitation', invitationId, 'buwuhans'] })

    if (!isInstant) {
      void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
      void queryClient.invalidateQueries({ queryKey: ['buwuhans'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: BuwuhanPayload) => {
      const body = {
        giverName: payload.giverName.trim(),
        giverAddress: payload.giverAddress?.trim() || null,
        note: payload.note?.trim() || null,
        items: payload.items.map((it) => ({
          itemName: it.itemName.trim(),
          quantity: Number(it.quantity) || 1,
          unit: it.unit,
          category: it.category || null,
          estimatedValue:
            it.estimatedValue !== null && it.estimatedValue !== undefined && it.estimatedValue !== ('' as unknown)
              ? Number(it.estimatedValue)
              : null,
        })),
      }
      return postData<ApiBuwuhan, typeof body>(`/invitations/${invitationId}/buwuhans`, body)
    },
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BuwuhanPayload }) => {
      const body = {
        giverName: payload.giverName.trim(),
        giverAddress: payload.giverAddress?.trim() || null,
        note: payload.note?.trim() || null,
        items: payload.items.map((it) => ({
          itemName: it.itemName.trim(),
          quantity: Number(it.quantity) || 1,
          unit: it.unit,
          category: it.category || null,
          estimatedValue:
            it.estimatedValue !== null && it.estimatedValue !== undefined && it.estimatedValue !== ('' as unknown)
              ? Number(it.estimatedValue)
              : null,
        })),
      }
      return patchData<ApiBuwuhan, typeof body>(`/buwuhans/${id}`, body)
    },
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`/buwuhans/${id}`),
    onSuccess: invalidateAll,
  })

  const records = useMemo(() => listQuery.data ?? [], [listQuery.data])

  return {
    records,
    summary: summaryQuery.data ?? EMPTY_SUMMARY,

    addBuwuhan: (payload: BuwuhanPayload) => createMutation.mutateAsync(payload),
    updateBuwuhan: (id: string, payload: BuwuhanPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    removeBuwuhan: (id: string) => deleteMutation.mutateAsync(id),

    isLoading: enabled && listQuery.isLoading,
    isError: false,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}