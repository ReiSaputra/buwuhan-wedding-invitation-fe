import type { PlanCode } from '@/types/dashboard'

/**
 * Cermin dari backend src/lib/plan-quota.ts.
 * Nilai -1 berarti tanpa batas (unlimited).
 */
export type PlanQuota = {
  maxActiveInvitations: number
  maxGuestsPerInvitation: number
  maxGalleryPhotos: number
}

export const PLAN_QUOTA: Record<PlanCode, PlanQuota> = {
  FREE: { maxActiveInvitations: 1, maxGuestsPerInvitation: 50, maxGalleryPhotos: 10 },
  PRO: { maxActiveInvitations: 5, maxGuestsPerInvitation: 500, maxGalleryPhotos: 50 },
  MAX: { maxActiveInvitations: -1, maxGuestsPerInvitation: -1, maxGalleryPhotos: -1 },
}

/** true jika kuota sudah penuh. Limit negatif = unlimited, selalu false. */
export function isQuotaReached(used: number, limit: number): boolean {
  if (limit < 0) return false
  return used >= limit
}

/** Teks tampilan kuota, mis. "12 / 50" atau "12 / Tanpa batas". */
export function formatQuota(used: number, limit: number): string {
  return limit < 0 ? `${used} / Tanpa batas` : `${used} / ${limit}`
}