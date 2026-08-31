/**
 * Kode paket langganan yang tersedia pada platform Buwuhan.
 */
export type PlanCode = 'FREE' | 'PRO' | 'MAX'

/**
 * Representasi profil pengguna/admin yang sedang aktif login.
 */
export type CurrentUser = {
  id: string
  fullName: string
  nickname: string
  role: string
  avatarUrl: string | null
  plan: PlanCode
  email?: string
}

/**
 * Status publikasi undangan digital.
 */
export type InvitationStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED'

/**
 * Ringkasan data undangan digital untuk ditampilkan pada daftar/kartu dashboard.
 */
export type InvitationSummary = {
  id: string
  slug: string
  coupleName: string
  eventDate: string | null
  eventTime: string | null
  thumbnailUrl: string | null
  status: InvitationStatus
  guestCount: number
  checkedInCount: number
  themeName?: string
  title?: string
}

/**
 * Statistik ringkasan pada beranda dashboard.
 */
export type DashboardStats = {
  totalInvitations: number
  totalGuests: number
  totalCheckedIn: number
}

/**
 * Mode tampilan daftar undangan (List baris atau Grid kartu).
 */
export type ViewMode = 'list' | 'grid'

/**
 * Detail lengkap sebuah undangan digital untuk panel manajemen per-undangan.
 */
export type InvitationDetail = {
  id: string
  slug: string
  panelName: string
  coupleName: string
  title: string
  eventDate: string | null
  eventTime: string | null
  venue: string | null
  address: string | null
  status: InvitationStatus
  guestCount: number
  confirmedCount: number
  checkedInCount: number
  buwuhTotal: number
}

/**
 * Log catatan aktivitas tamu dan konfirmasi kehadiran pada panel undangan.
 */

export type ActivityLog = {
  id: string
  message: string
  createdAt: string
  detail?: string
  category?: 'rsvp' | 'ucapan' | 'hadiah' | 'checkin'
  authorName?: string
}

/**
 * Aksi cepat atau jalan pintas fitur pada panel per-undangan.
 */
export type QuickAction = {
  id: string
  label: string
  to: string
  value?: string
}

/**
 * Definisi tingkatan paket langganan beserta harga dan rincian fitur.
 */
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

/**
 * Tipe notifikasi pengguna untuk popover topbar.
 */
export type UserNotification = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}