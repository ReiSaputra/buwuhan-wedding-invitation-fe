/**
 * Definisi Tipe Data Modul Admin Platform Buwuhan
 */

import type { ApiInvitation } from './invitation-api'

export type UserRole = 'USER' | 'ADMIN'
export type PlanTier = 'FREE' | 'PRO' | 'MAX'
export type InvitationStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED'
export type EventCategory = 'WEDDING' | 'KHITANAN' | 'RASULAN' | 'AQIQAH'

/**
 * Paginasi standar respons API admin
 */
export interface AdminPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Data ringkasan statistik platform global (GET /admin/dashboard/stats)
 */
export interface AdminDashboardStats {
  users: {
    total: number
    byRole?: Record<string, number>
    byTier?: Record<string, number>
  }
  invitations: {
    total: number
    byStatus?: Record<string, number>
    byCategory?: Record<string, number>
  }
  guests: {
    totalGuests?: number
    totalCheckedIn?: number
    totalRsvps?: number
    byRsvpStatus?: Record<string, number>
    total?: number
    attended?: number
    unattended?: number
  }
  rsvps?: {
    total?: number
    confirmed?: number
    declined?: number
  }
  topTemplates: Array<{
    id: string
    name: string
    slug: string
    tier?: PlanTier
    previewImageUrl?: string
    usageCount: number
  }>
}

/**
 * Entri ringkas pengguna platform pada daftar tabel admin
 */
export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  planTier: PlanTier
  createdAt: string
  updatedAt: string
  totalInvitations: number
}

/**
 * Respon daftar pengguna (GET /admin/users)
 */
export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: AdminPagination
}

/**
 * Undangan yang dimiliki pengguna pada audit detail pengguna
 */
export interface UserOwnedInvitation {
  id: string
  title: string
  slug: string
  status: InvitationStatus
  eventCategory: EventCategory
  eventDate: string
  eventTime?: string
  venue?: string
  totalGuests: number
  createdAt: string
}

/**
 * Detail profil dan audit pengguna (GET /admin/users/:id)
 */
export interface AdminUserDetail {
  id: string
  fullName: string
  email: string
  role: UserRole
  planTier: PlanTier
  createdAt: string
  updatedAt: string
  stats: {
    totalInvitations: number
    totalGuests: number
  }
  invitations: UserOwnedInvitation[]
}

/**
 * Entri undangan pada moderasi undangan global (GET /admin/invitations)
 */
export interface AdminInvitation {
  id: string
  title: string
  slug: string
  status: InvitationStatus
  eventCategory: EventCategory
  eventDate: string
  eventTime?: string
  venue?: string
  address?: string
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    fullName: string
    email: string
    planTier?: PlanTier
  }
  template?: {
    id: string
    name: string
    slug: string
    previewImageUrl?: string
  } | null
  stats: {
    totalGuests: number
    totalRsvps: number
  }
}

/**
 * Respon daftar undangan admin (GET /admin/invitations)
 */
export interface AdminInvitationsResponse {
  invitations: AdminInvitation[]
  pagination: AdminPagination
}

/**
 * Detail lengkap satu undangan untuk keperluan moderasi
 * (GET /admin/invitations/:id).
 *
 * Bentuknya = ApiInvitation (data undangan penuh: mempelai, galeri, kisah)
 * ditambah data pemilik dan statistik tamu.
 */
export interface AdminInvitationDetail extends ApiInvitation {
  /** Backend mengisi true hanya untuk eventCategory WEDDING */
  showCouples?: boolean
  owner: {
    id: string
    fullName: string
    email: string
    planTier: PlanTier
  }
  stats: {
    totalGuests: number
    totalRsvps: number
  }
}

/**
 * Entri template katalog admin (GET /admin/templates)
 */
export interface AdminTemplate {
  id: string
  name: string
  slug: string
  tier: PlanTier
  eventCategory: string
  previewImageUrl?: string
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Body POST /templates — seluruh field wajib kecuali yang bertanda opsional.
 */
export interface CreateTemplatePayload {
  name: string
  slug: string
  tier: PlanTier
  eventCategory?: EventCategory
  previewImageUrl: string
  isActive?: boolean
}

/**
 * Body PATCH /templates/:id — semua opsional, minimal satu field terisi.
 */
export type UpdateTemplatePayload = Partial<CreateTemplatePayload>

/**
 * Respon daftar template admin (GET /admin/templates)
 */
export interface AdminTemplatesResponse {
  templates: AdminTemplate[]
  pagination: AdminPagination
}

/**
 * Parameter query pencarian & filter pengguna
 */
export interface AdminUserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole | 'ALL'
  planTier?: PlanTier | 'ALL'
}

/**
 * Parameter query pencarian & filter undangan
 */
export interface AdminInvitationQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: InvitationStatus | 'ALL'
  eventCategory?: EventCategory | 'ALL'
}

export interface AdminTemplateQueryParams {
  page?: number
  limit?: number
  isActive?: boolean | 'ALL'
  tier?: PlanTier | 'ALL'
  eventCategory?: string | 'ALL'
  search?: string
}

export interface AdminPlatformSettings {
  appName: string
  maintenanceMode: boolean
  registrationOpen: boolean
  freeTierLimit: number
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  notifyNewUser: boolean
  notifyNewInvitation: boolean
  notifyCriticalTakedown: boolean
  notifyQuotaExceeded: boolean
  weeklyReportEmail: boolean
  auditLogging: boolean
}

export interface AdminAuditLog {
  id: string
  action: string
  actorId: string
  actorName: string
  actorRole: string
  targetResource: string
  ipAddress: string
  details?: Record<string, unknown>
  createdAt: string
}

// ── Langganan (Admin) ────────────────────────────────────────────────

/** Sama dengan enum SubscriptionStatus di backend. */
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
export type BillingPeriod = 'MONTHLY' | 'YEARLY'

export interface AdminSubscriptionPlan {
  code: string
  name: string
  price: number
  currency: string
  period: BillingPeriod
  features: string[]
  isActive: boolean
  tier: PlanTier
}

/** Bentuk AdminSubscriptionData dari backend (subscription.types.ts:99). */
export interface AdminSubscription {
  id: string
  userId: string
  user: { id: string; fullName: string; email: string }
  planCode: string
  plan: AdminSubscriptionPlan
  status: SubscriptionStatus
  startedAt: string | null
  expiresAt: string | null
  provider: 'MIDTRANS' | null
  providerRef: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscription[]
  pagination: AdminPagination
}

export interface AdminSubscriptionQueryParams {
  page?: number
  limit?: number
  status?: SubscriptionStatus | 'ALL'
  userId?: string
}