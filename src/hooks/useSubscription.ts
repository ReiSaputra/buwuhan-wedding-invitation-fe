import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData } from "@/lib/api";
import type {
  InvoiceItem,
  UpgradePayload,
  UpgradeResponse,
  UserSubscription,
} from "@/types/subscription";

/**
 * Hook pengelola data status langganan aktif pengguna, alur upgrade paket,
 * serta riwayat faktur/invoice pembayaran.
 *
 * Endpoint:
 * - GET  /subscriptions/me
 * - POST /subscriptions/checkout
 * - GET  /invoices/me
 */
export function useSubscription() {
  const queryClient = useQueryClient()

  // Ditandai true saat checkout mengembalikan status PENDING, supaya status
  // langganan dipolling sampai webhook Midtrans mengaktifkannya.
  const [checkoutPending, setCheckoutPending] = useState(false)

  // Query: Status Langganan Aktif Pengguna
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: async (): Promise<UserSubscription> => {
      return fetchData<UserSubscription>('/subscriptions/me')
    },
    refetchInterval: (query) => {
      if (!checkoutPending) return false
      return query.state.data?.status === 'ACTIVE' ? false : 5000
    },
  })

  // Derived, bukan state: begitu status ACTIVE, banner otomatis hilang
  // tanpa perlu setState di dalam effect.
  const isAwaitingPayment = checkoutPending && subscriptionQuery.data?.status !== 'ACTIVE'

  // Hentikan polling begitu langganan berubah menjadi ACTIVE.
  useEffect(() => {
    if (isAwaitingPayment && subscriptionQuery.data?.status === "ACTIVE") {
      setIsAwaitingPayment(false);
      invalidateAll();
    }
  }, [isAwaitingPayment, subscriptionQuery.data?.status]);

  // Query: Riwayat Invoice Tagihan
  const invoicesQuery = useQuery({
    queryKey: ["subscription", "me", "invoices"],
    queryFn: async (): Promise<InvoiceItem[]> => {
      try {
        const data = await fetchData<InvoiceItem[]>("/invoices/me");
        return data ?? [];
      } catch {
        return [];
      }
    },
  });

function invalidateAll() {
  void queryClient.invalidateQueries({ queryKey: ['subscription'] })
  void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

// Saat pembayaran akhirnya terkonfirmasi, segarkan profil & dashboard
// supaya badge paket ikut berubah. Tidak ada setState di sini.
useEffect(() => {
  if (checkoutPending && subscriptionQuery.data?.status === 'ACTIVE') {
    void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}, [checkoutPending, subscriptionQuery.data?.status, queryClient])

  // Mutation: Ajukan Upgrade Tier
  // Mutation: Ajukan Upgrade Tier
const upgradeMutation = useMutation({
  mutationFn: (payload: UpgradePayload) =>
    postData<UpgradeResponse, UpgradePayload>('/subscriptions/checkout', payload),
  onSuccess: (res) => {
    setCheckoutPending(res.status === 'PENDING')
    invalidateAll()
  },
})

  return {
    subscription: subscriptionQuery.data,
    invoices: invoicesQuery.data ?? [],
    isLoading: subscriptionQuery.isLoading,
    isInvoicesLoading: invoicesQuery.isLoading,
    isError: subscriptionQuery.isError,
    upgradeSubscription: upgradeMutation.mutateAsync,
    isUpgrading: upgradeMutation.isPending,
    /** True selama menunggu konfirmasi pembayaran dari webhook Midtrans. */
    isAwaitingPayment,
  };
}
