import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiOwnerBuwuhan } from '@/types/invitation-api'

export type AllBuwuhanSummary = {
  totalTransactions: number
  totalItems: number
  totalEstimatedValue: number
  totalThisMonth: number
}

/**
 * Hook Catatan Buwuh tingkat dashboard: mengambil seluruh catatan buwuh
 * dari semua undangan milik pengguna beserta ringkasannya.
 *
 * Endpoint: GET /buwuhans
 */
export function useAllBuwuhan() {
  const query = useQuery({
    queryKey: ['buwuhans', 'all'],
    queryFn: () => fetchData<ApiOwnerBuwuhan[]>('/buwuhans'),
  })

  const records = useMemo(() => query.data ?? [], [query.data])

  const summary = useMemo<AllBuwuhanSummary>(() => {
    const now = new Date()

    return records.reduce<AllBuwuhanSummary>(
      (acc, record) => {
        const received = new Date(record.receivedAt)
        const isThisMonth =
          received.getFullYear() === now.getFullYear() &&
          received.getMonth() === now.getMonth()

        acc.totalTransactions += 1
        acc.totalItems += record.items.length
        acc.totalEstimatedValue += record.items.reduce(
          (sum, item) => sum + (item.estimatedValue ?? 0),
          0,
        )
        if (isThisMonth) acc.totalThisMonth += 1

        return acc
      },
      { totalTransactions: 0, totalItems: 0, totalEstimatedValue: 0, totalThisMonth: 0 },
    )
  }, [records])

  return {
    records,
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}