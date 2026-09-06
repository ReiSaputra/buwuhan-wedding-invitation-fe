import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData } from '@/lib/api'
import type {
  InvoiceItem,
  UpgradePayload,
  UpgradeResponse,
  UserSubscription,
} from '@/types/subscription'
import { useCurrentUser } from '@/hooks/useCurrentUser'

/**
 * Hook pengelola data status langganan aktif pengguna, alur upgrade paket,
 * serta riwayat faktur/invoice pembayaran.
 *
 * Endpoint:
 * - GET  /subscriptions/me
 * - POST /subscriptions/upgrade
 * - GET  /subscriptions/me/invoices
 */
export function useSubscription() {
  const queryClient = useQueryClient()
  const user = useCurrentUser()

  // Query: Status Langganan Aktif Pengguna
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: async (): Promise<UserSubscription> => {
      try {
        const data = await fetchData<UserSubscription>('/subscriptions/me')
        return data
      } catch {
        // Fallback default sesuai profil user saat ini
        return {
          id: `sub-${user.id}`,
          userId: user.id,
          planTier: user.plan || 'FREE',
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          expiresAt: user.plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          limits: {
            maxInvitations: user.plan === 'MAX' ? 999 : user.plan === 'PRO' ? 3 : 1,
            maxGuests: user.plan === 'FREE' ? 50 : 999999,
            maxPhotos: user.plan === 'MAX' ? 999 : user.plan === 'PRO' ? 100 : 10,
            maxStaff: user.plan === 'MAX' ? 999 : user.plan === 'PRO' ? 3 : 0,
            allowCustomDomain: user.plan === 'MAX',
            allowQrCheckin: user.plan !== 'FREE',
            allowExport: user.plan !== 'FREE',
            allowCustomMusic: true,
            watermark: user.plan === 'FREE',
          },
        }
      }
    },
  })

  // Query: Riwayat Invoice Tagihan
  const invoicesQuery = useQuery({
    queryKey: ['subscription', 'me', 'invoices'],
    queryFn: async (): Promise<InvoiceItem[]> => {
      try {
        const data = await fetchData<InvoiceItem[]>('/subscriptions/me/invoices')
        return data ?? []
      } catch {
        return []
      }
    },
  })

  function invalidateAll() {
    void queryClient.invalidateQueries({ queryKey: ['subscription'] })
    void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  // Mutation: Ajukan Upgrade Tier
  const upgradeMutation = useMutation({
    mutationFn: async (payload: UpgradePayload) => {
      try {
        const res = await postData<UpgradeResponse, UpgradePayload>(
          '/subscriptions/upgrade',
          payload,
        )
        return res
      } catch (err) {
        console.warn('Backend upgrade endpoint belum aktif, menggunakan mock response:', err)
        const mockInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`
        return {
          invoiceId: `inv-${Date.now()}`,
          invoiceNumber: mockInvoiceNumber,
          amount: payload.planTier === 'MAX' ? 149000 : 49000,
          paymentUrl: null,
          snapToken: null,
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BUWUHAN-PAYMENT-' + mockInvoiceNumber,
          virtualAccountNumber: '8801' + Math.floor(10000000 + Math.random() * 90000000),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING' as const,
        }
      }
    },
    onSuccess: invalidateAll,
  })

  return {
    subscription: subscriptionQuery.data,
    invoices: invoicesQuery.data ?? [],
    isLoading: subscriptionQuery.isLoading,
    isInvoicesLoading: invoicesQuery.isLoading,
    isError: subscriptionQuery.isError,
    upgradeSubscription: upgradeMutation.mutateAsync,
    isUpgrading: upgradeMutation.isPending,
  }
}
