export type PlanCode = 'FREE' | 'PRO' | 'MAX'

export type CurrentUser = {
  id: string
  fullName: string
  nickname: string
  role: string
  avatarUrl: string | null
  plan: PlanCode
}

export type InvitationStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED'

export type InvitationSummary = {
  id: string
  slug: string
  coupleName: string
  eventDate: string
  eventTime: string
  thumbnailUrl: string | null
  status: InvitationStatus
  guestCount: number
  checkedInCount: number
}

export type DashboardStats = {
  totalInvitations: number
  totalGuests: number
  totalCheckedIn: number
}

export type ViewMode = 'list' | 'grid'

export type InvitationDetail = {
  id: string
  slug: string
  panelName: string
  coupleName: string
  eventDate: string
  guestCount: number
  confirmedCount: number
  buwuhTotal: number
}

export type ActivityLog = {
  id: string
  message: string
  createdAt: string
  detail?: string
}

export type QuickAction = {
  id: string
  label: string
  to: string
  value?: string
}

export type PlanTier = {
  code: PlanCode
  name: string
  /** Harga per bulan dalam Rupiah. 0 = gratis */
  price: number
  description: string
  features: string[]
  ctaLabel: string
  isPopular?: boolean
}