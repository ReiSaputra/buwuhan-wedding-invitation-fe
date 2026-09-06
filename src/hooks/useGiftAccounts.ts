import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type { GiftAccount, GiftAccountPayload } from '@/types/panel'
import { GIFT_ACCOUNTS, GIFT_ADDRESS } from '@/config/gift-accounts'

export interface PublicGiftData {
  accounts: GiftAccount[]
  giftAddress?: string | null
}

const STORAGE_PREFIX = 'buwuhan_gift_accounts_'

function getLocalAccounts(idOrSlug: string): GiftAccount[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${idOrSlug}`)
    if (raw) {
      return JSON.parse(raw) as GiftAccount[]
    }
  } catch {
    // Ignore storage parse error
  }
  return []
}

function saveLocalAccounts(idOrSlug: string, accounts: GiftAccount[]) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${idOrSlug}`, JSON.stringify(accounts))
  } catch {
    // Ignore storage quota error
  }
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
      const local = getLocalAccounts(invitationId)
      try {
        const data = await fetchData<GiftAccount[]>(`/invitations/${invitationId}/gift-accounts`)
        if (data && data.length > 0) {
          saveLocalAccounts(invitationId, data)
          return data
        }
        return local.length > 0 ? local : (data ?? [])
      } catch (err) {
        console.warn('Gagal memuat gift-accounts backend, menggunakan cache lokal jika ada:', err)
        return local
      }
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
    mutationFn: async (payload: GiftAccountPayload) => {
      // Simpan ke local storage terlebih dahulu agar langsung tersedia
      const current = getLocalAccounts(invitationId)
      const newAcc: GiftAccount = {
        id: `local-${Date.now()}`,
        invitationId,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber,
        accountHolder: payload.accountHolder,
        type: payload.type,
        qrCodeUrl: payload.qrCodeUrl ?? null,
        createdAt: new Date().toISOString(),
      }
      const updated = [newAcc, ...current]
      saveLocalAccounts(invitationId, updated)

      try {
        const res = await postData<GiftAccount, GiftAccountPayload>(
          `/invitations/${invitationId}/gift-accounts`,
          payload,
        )
        if (res?.id) {
          saveLocalAccounts(
            invitationId,
            updated.map((item) => (item.id === newAcc.id ? res : item)),
          )
        }
        return res ?? newAcc
      } catch (err) {
        console.warn('Backend POST gift-account belum aktif/gagal, tersimpan di cache lokal.', err)
        return newAcc
      }
    },
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: GiftAccountPayload }) => {
      const current = getLocalAccounts(invitationId)
      const updated = current.map((item) =>
        item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item,
      )
      saveLocalAccounts(invitationId, updated)

      try {
        const res = await patchData<GiftAccount, GiftAccountPayload>(`/gift-accounts/${id}`, payload)
        return res
      } catch (err) {
        console.warn('Backend PATCH gift-account belum aktif, tersimpan di cache lokal.', err)
        return updated.find((item) => item.id === id) as GiftAccount
      }
    },
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = getLocalAccounts(invitationId)
      const updated = current.filter((item) => item.id !== id)
      saveLocalAccounts(invitationId, updated)

      try {
        await deleteData(`/gift-accounts/${id}`)
      } catch (err) {
        console.warn('Backend DELETE gift-account belum aktif, dihapus dari cache lokal.', err)
      }
    },
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
      // Periksa cache lokal undangan terlebih dahulu
      const local = getLocalAccounts(slug)

      try {
        const res = await fetchData<PublicGiftData | GiftAccount[]>(
          `/public/invitations/${slug}/gift-accounts`,
        )

        if (Array.isArray(res)) {
          if (res.length > 0) {
            saveLocalAccounts(slug, res)
            return { accounts: res, giftAddress: GIFT_ADDRESS }
          }
        } else if (res?.accounts && res.accounts.length > 0) {
          saveLocalAccounts(slug, res.accounts)
          return {
            accounts: res.accounts,
            giftAddress: res.giftAddress ?? GIFT_ADDRESS,
          }
        }
      } catch {
        // Abaikan error jaringan jika backend sedang proses deployment
      }

      // Gunakan data lokal jika tersedia
      if (local.length > 0) {
        return { accounts: local, giftAddress: GIFT_ADDRESS }
      }

      // Cari cache lokal dari invitation ID yang mungkin ada di localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_PREFIX)) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw) as GiftAccount[]
              if (parsed && parsed.length > 0) {
                return { accounts: parsed, giftAddress: GIFT_ADDRESS }
              }
            }
          } catch {
            // Ignore
          }
        }
      }

      // Fallback ke config gift-accounts.ts
      return {
        accounts: GIFT_ACCOUNTS.map((acc, index) => ({
          id: `static-${index}`,
          bankName: acc.bankName,
          accountNumber: acc.accountNumber,
          accountHolder: acc.accountHolder,
          type: acc.type,
          qrCodeUrl: (acc as Record<string, unknown>).qrCodeUrl as string | undefined,
        })),
        giftAddress: GIFT_ADDRESS,
      }
    },
    enabled,
    staleTime: 1000 * 30, // 30 detik
  })

  return {
    accounts: query.data?.accounts ?? [],
    giftAddress: query.data?.giftAddress ?? GIFT_ADDRESS,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
