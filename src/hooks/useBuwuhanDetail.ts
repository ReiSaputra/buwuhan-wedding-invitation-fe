import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiBuwuhan } from '@/types/invitation-api'

/**
 * Custom React Hook untuk mengambil detail satu catatan buwuh
 * (GET /buwuhans/:id).
 *
 * Backend memverifikasi kepemilikan undangan: catatan milik orang lain
 * menghasilkan 403, ID tak dikenal menghasilkan 404.
 *
 * @param invitationId - ID undangan induk, dipakai sebagai awalan queryKey
 *                       agar ikut tersegarkan oleh invalidateAll() di useBuwuhan
 * @param buwuhanId - ID catatan buwuh; null membuat query tidak dijalankan
 */
export function useBuwuhanDetail(invitationId: string, buwuhanId: string | null) {
  const query = useQuery({
    queryKey: ['invitation', invitationId, 'buwuhans', buwuhanId],
    queryFn: () => fetchData<ApiBuwuhan>(`/buwuhans/${buwuhanId}`),
    enabled: Boolean(buwuhanId),
    retry: false, // 403/404 tidak perlu diulang
  })

  return {
    buwuhan: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}