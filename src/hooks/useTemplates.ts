import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiTemplate } from '@/types/invitation-api'

/**
 * Custom React Hook untuk mengambil daftar template undangan dari backend
 * (GET /templates). Dipakai bersama oleh InvitationForm dan halaman Template
 * agar keduanya berbagi satu cache React Query.
 *
 * @returns Daftar `templates` beserta flag status permintaan
 */
export function useTemplates() {
  const query = useQuery({
    queryKey: ['templates'],
    queryFn: () => fetchData<ApiTemplate[]>('/templates'),
    staleTime: 10 * 60 * 1000,
  })

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}