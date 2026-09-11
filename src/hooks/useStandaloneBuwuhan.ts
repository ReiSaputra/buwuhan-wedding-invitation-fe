import { useMemo } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  deleteData,
  fetchData,
  patchData,
  postData,
} from '@/lib/api'
import type {
  ApiBuwuhan,
  BuwuhanPayload,
} from '@/types/invitation-api'

type StandaloneBuwuhanPayload = Pick<
  BuwuhanPayload,
  | 'giverName'
  | 'giverAddress'
  | 'invitationTitle'
  | 'note'
  | 'receivedAt'
  | 'items'
>

/**
 * Mempersiapkan payload catatan buwuh mandiri.
 * Catatan standalone selalu dimiliki langsung oleh user login dan
 * tidak boleh dihubungkan ke invitationId yang ketat, namun dapat menyimpan nama acara manual.
 */
function createStandalonePayload(
  payload: BuwuhanPayload,
): StandaloneBuwuhanPayload {
  return {
    giverName: payload.giverName,
    giverAddress: payload.giverAddress ?? null,
    invitationTitle: payload.invitationTitle ?? null,
    note: payload.note ?? null,
    receivedAt: payload.receivedAt,
    items: payload.items,
  }
}

/**
 * Mengelola Catatan Buwuh Mandiri milik user login.
 *
 * Endpoint:
 * - GET    /buwuhans/standalone
 * - POST   /buwuhans/standalone
 * - PATCH  /buwuhans/:id
 * - DELETE /buwuhans/:id
 */
export function useStandaloneBuwuhan() {
  const queryClient = useQueryClient()

  const queryKey = ['buwuhans', 'standalone'] as const

  const listQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<ApiBuwuhan[]> => {
      const data = await fetchData<ApiBuwuhan[]>(
        '/buwuhans/standalone',
      )

      return data ?? []
    },
    staleTime: 30_000,
  })

  function invalidateStandaloneRecords() {
    void queryClient.invalidateQueries({
      queryKey,
    })
  }

  const createMutation = useMutation({
    mutationFn: (payload: BuwuhanPayload) =>
      postData<
        ApiBuwuhan,
        StandaloneBuwuhanPayload
      >(
        '/buwuhans/standalone',
        createStandalonePayload(payload),
      ),
    onSuccess: invalidateStandaloneRecords,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: BuwuhanPayload
    }) =>
      patchData<
        ApiBuwuhan,
        StandaloneBuwuhanPayload
      >(
        `/buwuhans/${id}`,
        createStandalonePayload(payload),
      ),
    onSuccess: invalidateStandaloneRecords,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteData(`/buwuhans/${id}`),
    onSuccess: invalidateStandaloneRecords,
  })

  const records = useMemo(
    () =>
      (listQuery.data ?? []).filter((r) => {
        const item = r as unknown as Record<string, unknown>
        const hasInvitation = Boolean(
          r.invitationId || item.invitation_id || item.invitation,
        )
        return !hasInvitation
      }),
    [listQuery.data],
  )

  return {
    records,

    addBuwuhan: (payload: BuwuhanPayload) =>
      createMutation.mutateAsync(payload),

    updateBuwuhan: (
      id: string,
      payload: BuwuhanPayload,
    ) =>
      updateMutation.mutateAsync({
        id,
        payload,
      }),

    removeBuwuhan: (id: string) =>
      deleteMutation.mutateAsync(id),

    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  }
}