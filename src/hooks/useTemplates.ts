import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiEventCategory, ApiTemplateItem } from '@/types/invitation-api'

/**
 * Custom React Hook untuk mengambil daftar template undangan dari backend
 * (GET /templates). Dipakai bersama oleh InvitationForm dan halaman Template
 * agar keduanya berbagi satu cache React Query.
 *
 * Bentuk data mengikuti `TemplateData` di backend: previewImageUrl, tier, dan
 * isAccessible (dihitung dari paket langganan user yang sedang login).
 *
 * @param category - Filter opsional kategori acara (query ?category=)
 * @returns Daftar `templates` beserta flag status permintaan
 */
export function useTemplates(category?: ApiEventCategory) {
  const query = useQuery({
    queryKey: ['templates', category ?? 'ALL'],
    queryFn: () =>
      fetchData<ApiTemplateItem[]>(
        category ? `/templates?category=${category}` : '/templates',
      ),
    staleTime: 10 * 60 * 1000,
  })

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

/**
 * Custom React Hook untuk mengambil satu template berdasarkan slug
 * (GET /templates/:slug). Dipakai untuk pratinjau detail tanpa harus
 * memuat ulang seluruh katalog.
 *
 * Backend hanya mengembalikan template yang masih aktif; slug tidak dikenal
 * menghasilkan 404 "Template tidak ditemukan".
 *
 * @param slug - Slug template; null/kosong membuat query tidak dijalankan
 */
export function useTemplateDetail(slug: string | null) {
  const query = useQuery({
    queryKey: ['templates', 'detail', slug],
    queryFn: () => fetchData<ApiTemplateItem>(`/templates/${slug}`),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
    retry: false, // 404 tidak perlu diulang
  })

  return {
    template: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}