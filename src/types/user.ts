import type { ApiPlanTier } from './invitation-api'

/**
 * Tipe data profil pengguna dari GET /users/me
 */
export interface UserProfile {
  id: string
  fullName: string
  nickname?: string
  email: string
  phone?: string
  avatarUrl?: string | null
  role: string
  planTier: ApiPlanTier
  emailVerified?: boolean
  notifyRsvpWa?: boolean
  notifyBuwuhWa?: boolean
  notifyMarketing?: boolean
  createdAt: string
  updatedAt?: string
}

/**
 * Payload untuk pembaruan profil di PATCH /users/me
 */
export interface UpdateProfilePayload {
  fullName?: string
  nickname?: string
  phone?: string
  avatarUrl?: string | null
  notifyRsvpWa?: boolean
  notifyBuwuhWa?: boolean
  notifyMarketing?: boolean
}

/**
 * Payload untuk ubah password di PATCH /users/me/password
 */
export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

/**
 * Payload untuk ubah email di PATCH /users/me/email
 */
export interface ChangeEmailPayload {
  newEmail: string
  password?: string
}

/**
 * Payload untuk hapus akun di DELETE /users/me
 */
export interface DeleteAccountPayload {
  password?: string
  reason?: string
}

/**
 * Informasi sesi login aktif dari GET /v1/api/auth/sessions
 */
export interface UserSession {
  id: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: string
  isCurrent: boolean
}
