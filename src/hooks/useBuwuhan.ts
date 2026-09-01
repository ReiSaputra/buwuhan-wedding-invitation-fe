import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
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
    queryFn: () => fetchData<ApiBuwuhan[]>(`/invitations/${invitationId}/buwuhans`),
    enabled,
  })

  const summaryQuery = useQuery({
    queryKey: ['invitation', invitationId, 'buwuhan-summary'],
    queryFn: () =>
      fetchData<ApiBuwuhanSummary>(`/invitations/${invitationId}/buwuhans/summary`),
    enabled,
  })

  /** Menyegarkan daftar buwuh, ringkasannya, dan ringkasan dashboard. */
  function invalidateAll() {
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: BuwuhanPayload) =>
      postData<ApiBuwuhan, BuwuhanPayload>(`/invitations/${invitationId}/buwuhans`, payload),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BuwuhanPayload }) =>
      patchData<ApiBuwuhan, BuwuhanPayload>(`/buwuhans/${id}`, payload),
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

    isLoading: enabled && (listQuery.isLoading || summaryQuery.isLoading),
    isError: listQuery.isError || summaryQuery.isError,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}