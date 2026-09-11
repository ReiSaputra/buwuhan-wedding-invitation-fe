import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData, api } from '@/lib/api'
import type { GiftAccount, GiftAccountPayload, PublicGiftAccount } from '@/types/panel'
import type { BackendSuccessEnvelope } from '@/types/auth'

export interface PublicGiftData {
  accounts: PublicGiftAccount[]
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
 * Hook publik untuk mengambil daftar rekening kado & e-wallet tamu (tanpa autentikasi).
 *
 * Endpoint:
 * - GET /v1/api/public/invitations/:slug/gift-accounts
 *
 * @param slug - Slug tautan undangan publik
 */
export function usePublicGiftAccounts(slug: string) {
  const enabled = Boolean(slug)

  const query = useQuery({
    queryKey: ['public-invitation', slug, 'gift-accounts'],
    queryFn: async (): Promise<PublicGiftAccount[]> => {
      try {
        const response = await api.get<BackendSuccessEnvelope<PublicGiftAccount[]>>(
          `/public/invitations/${slug}/gift-accounts`
        )
        return response.data?.data ?? []
      } catch (err: unknown) {
        // Jika 404 (slug tidak ditemukan atau masih DRAFT), kembalikan array kosong secara aman
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          return []
        }
        throw err
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 menit
  })

  return {
    accounts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}