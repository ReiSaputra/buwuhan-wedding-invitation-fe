import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PLAN_QUOTA, formatQuota, isQuotaReached } from '@/config/plan-quota'
import type { PlanCode } from '@/types/dashboard'

type UsageInput = {
  invitations?: number
  guests?: number
  galleryPhotos?: number
}

/**
 * Menampilkan sisa kuota paket aktif pengguna berdasarkan PLAN_QUOTA backend.
 * Semua argumen opsional — kirim hanya angka pemakaian yang relevan di halaman itu.
 */
export function useQuota(used: UsageInput = {}) {
  const user = useCurrentUser()
  const tier: PlanCode = user.plan ?? 'FREE'
  const quota = PLAN_QUOTA[tier]

  const invitationsUsed = used.invitations ?? 0
  const guestsUsed = used.guests ?? 0
  const photosUsed = used.galleryPhotos ?? 0

  return {
    tier,
    invitations: {
      used: invitationsUsed,
      limit: quota.maxActiveInvitations,
      text: formatQuota(invitationsUsed, quota.maxActiveInvitations),
      reached: isQuotaReached(invitationsUsed, quota.maxActiveInvitations),
    },
    guests: {
      used: guestsUsed,
      limit: quota.maxGuestsPerInvitation,
      text: formatQuota(guestsUsed, quota.maxGuestsPerInvitation),
      reached: isQuotaReached(guestsUsed, quota.maxGuestsPerInvitation),
    },
    galleryPhotos: {
      used: photosUsed,
      limit: quota.maxGalleryPhotos,
      text: formatQuota(photosUsed, quota.maxGalleryPhotos),
      reached: isQuotaReached(photosUsed, quota.maxGalleryPhotos),
    },
  }
}