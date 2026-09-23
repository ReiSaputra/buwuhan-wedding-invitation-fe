import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import { buildInvitationSubject } from '@/hooks/useInvitationDetail'
import type { DashboardApiData, ApiDashboardInvitationItem, ApiInvitation, ApiEventCategory } from '@/types/invitation-api'
import type { InvitationSummary, DashboardStats } from '@/types/dashboard'

/**
 * Menerjemahkan satu item undangan dari bentuk backend ke bentuk yang dipakai UI.
 */
function toInvitationSummary(
  item: ApiDashboardInvitationItem,
  detail?: ApiInvitation,
): InvitationSummary {
  const effectiveCategory = (
    detail?.eventCategory ||
    item.eventCategory ||
    (item.title.toLowerCase().includes('khitan')
      ? 'KHITANAN'
      : item.title.toLowerCase().includes('aqiqah') || item.title.toLowerCase().includes('akikah')
      ? 'AQIQAH'
      : item.title.toLowerCase().includes('rasul')
      ? 'RASULAN'
      : 'WEDDING')
  ).toUpperCase() as ApiEventCategory

  const isKhitanan = effectiveCategory === 'KHITANAN'
  const isAqiqah = effectiveCategory === 'AQIQAH'
  const isRasulan = effectiveCategory === 'RASULAN'

  let displayName = item.title
  if (detail) {
    displayName = buildInvitationSubject(detail)
  } else {
    const isGenericWeddingTitle =
      !item.title ||
      item.title.trim().toLowerCase() === 'pernikahan' ||
      item.title.trim().toLowerCase().startsWith('pernikahan')

    if (isKhitanan) {
      if (item.celebrantName) {
        displayName = item.celebrantName
          .replace(/^khitanan\s+/i, '')
          .replace(/^tasyakuran\s+(walimatul\s+)?khitan\s+/i, '')
          .trim() || item.celebrantName
      } else if (isGenericWeddingTitle) {
        displayName = 'Khitanan'
      } else {
        displayName = item.title
          .replace(/^khitanan\s+/i, '')
          .replace(/^tasyakuran\s+(walimatul\s+)?khitan\s+/i, '')
          .trim() || item.title
      }
    } else if (isAqiqah) {
      if (item.celebrantName) {
        displayName = item.celebrantName
          .replace(/^aqiqah\s+/i, '')
          .replace(/^tasyakuran\s+aqiqah\s+/i, '')
          .trim() || item.celebrantName
      } else if (isGenericWeddingTitle) {
        displayName = 'Aqiqah'
      } else {
        displayName = item.title
          .replace(/^aqiqah\s+/i, '')
          .replace(/^tasyakuran\s+aqiqah\s+/i, '')
          .trim() || item.title
      }
    } else if (isRasulan) {
      if (item.celebrantName) {
        displayName = item.celebrantName
      } else if (isGenericWeddingTitle) {
        displayName = 'Rasulan'
      }
    }
  }

  const coverUrl =
    detail?.galleryPhotos?.[0]?.imageUrl ||
    ((detail?.additionalInfo as Record<string, unknown> | null)?.coverImageUrl as string | undefined) ||
    item.templateThumbnail ||
    null

  return {
    id: item.id,
    slug: detail?.slug || item.slug,
    title: displayName,
    coupleName: displayName,
    eventCategory: effectiveCategory,
    // eventDate dari backend berbentuk ISO penuh ("2026-01-18T00:00:00.000Z"),
    // UI hanya butuh bagian tanggalnya.
    eventDate: item.eventDate ? item.eventDate.slice(0, 10) : detail?.eventDate ? detail.eventDate.slice(0, 10) : null,
    eventTime: item.eventTime || detail?.eventTime || null,
    thumbnailUrl: coverUrl,
    status: detail?.status || item.status,
    guestCount: item.totalGuests,
    checkedInCount: item.totalCheckedIn,
  }
}

/**
 * Custom React Hook untuk mengambil seluruh data dashboard pengguna
 * dari endpoint GET /dashboard (statistik + daftar undangan + info paket)
 * serta disinkronkan dengan GET /invitations untuk detail lengkap kategori dan ananda/mempelai.
 */
export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchData<DashboardApiData>('/dashboard'),
  })

  const invitationsQuery = useQuery({
    queryKey: ['invitations'],
    queryFn: () => fetchData<ApiInvitation[]>('/invitations'),
  })

  const invitationsMap = new Map<string, ApiInvitation>()
  for (const inv of invitationsQuery.data ?? []) {
    invitationsMap.set(inv.id, inv)
  }

  const invitations: InvitationSummary[] = (dashboardQuery.data?.invitations ?? []).map(
    (item) => toInvitationSummary(item, invitationsMap.get(item.id)),
  )

  const stats: DashboardStats = {
    totalInvitations: dashboardQuery.data?.stats.totalInvitations ?? 0,
    totalGuests: dashboardQuery.data?.stats.totalGuests ?? 0,
    totalCheckedIn: dashboardQuery.data?.stats.totalCheckedIn ?? 0,
  }

  return {
    invitations,
    stats,
    user: dashboardQuery.data?.user ?? null,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: () => {
      dashboardQuery.refetch()
      invitationsQuery.refetch()
    },
  }
}