import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type { GiftAccount, GiftAccountPayload } from '@/types/panel'

export interface PublicGiftData {
  accounts: GiftAccount[]
  giftAddress?: string | null
}

/**
 * Hook pengelola konfigurasi rekening digital & dompet penerima hadiah untuk pemilik undangan.
 *
 * Endpoint:
 * - GET    /invitations/:invitationId/gift-accounts
 * - POST   /invitations/:invitationId/gift-accounts
 * - PATCH  /gift-accounts/:id
 * - DELETE /gift-accounts/:id
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useGiftAccounts(invitationId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(invitationId)

  const accountsQuery = useQuery({
    queryKey: ['invitation', invitationId, 'gift-accounts'],
    queryFn: async () => {
      const data = await fetchData<GiftAccount[]>(`/invitations/${invitationId}/gift-accounts`)
      return data ?? []
    },
    enabled,
  })

  function invalidateAll() {
    void queryClient.invalidateQueries({
      queryKey: ['invitation', invitationId, 'gift-accounts'],
    })
    void queryClient.invalidateQueries({
      queryKey: ['invitation', invitationId],
    })
    void queryClient.invalidateQueries({
      queryKey: ['public-invitation'],
    })
  }

  const createMutation = useMutation({
    mutationFn: (payload: GiftAccountPayload) =>
      postData<GiftAccount, GiftAccountPayload>(
        `/invitations/${invitationId}/gift-accounts`,
        payload,
      ),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GiftAccountPayload }) =>
      patchData<GiftAccount, GiftAccountPayload>(`/gift-accounts/${id}`, payload),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`/gift-accounts/${id}`),
    onSuccess: invalidateAll,
  })

  return {
    accounts: accountsQuery.data ?? [],
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    error: accountsQuery.error,
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook untuk mengambil daftar rekening dan alamat kado pada halaman undangan publik.
 *
 * Endpoint:
 * - GET /public/invitations/:slug/gift-accounts
 *
 * @param slug - Slug tautan undangan publik
 */
export function usePublicGiftAccounts(slug: string) {
  const enabled = Boolean(slug)

  const query = useQuery({
    queryKey: ['public-invitation', slug, 'gift-accounts'],
    queryFn: async (): Promise<PublicGiftData> => {
      const res = await fetchData<PublicGiftData | GiftAccount[]>(
        `/public/invitations/${slug}/gift-accounts`,
      )

      if (Array.isArray(res)) {
        return { accounts: res, giftAddress: null }
      }

      return {
        accounts: res?.accounts ?? [],
        giftAddress: res?.giftAddress ?? null,
      }
    },
    enabled,
    staleTime: 1000 * 30, // 30 detik
  })

  return {
    accounts: query.data?.accounts ?? [],
    giftAddress: query.data?.giftAddress ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}