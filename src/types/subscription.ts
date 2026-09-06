import type { PlanCode } from '@/types/dashboard'

export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED'

export interface UserSubscription {
  id: string
  userId: string
  planTier: PlanCode
  status: SubscriptionStatus
  startDate: string
  expiresAt: string | null
  autoRenew?: boolean
  limits?: {
    maxInvitations: number
    maxGuests: number
    maxPhotos: number
    maxStaff: number
    allowCustomDomain: boolean
    allowQrCheckin: boolean
    allowExport: boolean
    allowCustomMusic: boolean
    watermark: boolean
  }
}

export interface UpgradePayload {
  planTier: PlanCode
  billingCycle: 'MONTHLY' | 'YEARLY'
  paymentMethod?: string
}

export interface UpgradeResponse {
  invoiceId: string
  invoiceNumber: string
  amount: number
  paymentUrl?: string | null
  snapToken?: string | null
  qrCodeUrl?: string | null
  virtualAccountNumber?: string | null
  expiresAt: string
  status: 'PENDING' | 'PAID'
}

export interface InvoiceItem {
  id: string
  invoiceNumber: string
  planTier: PlanCode
  billingCycle?: 'MONTHLY' | 'YEARLY'
  amount: number
  status: 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED'
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string
  downloadUrl?: string | null
}
