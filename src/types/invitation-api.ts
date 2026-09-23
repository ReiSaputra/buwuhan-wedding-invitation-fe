export type ApiInvitationStatus = "DRAFT" | "ACTIVE" | "COMPLETED";
export type ApiCoupleType = "BRIDE" | "GROOM";
export type ApiPlanTier = "FREE" | "PRO" | "MAX";

export interface ApiCouple {
  type: string;
  name: string;
  fatherName: string;
  motherName: string;
}

export interface ApiTemplate {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  description: string | null;
}

export interface ApiGalleryPhoto {
  id: string
  imageUrl: string
  caption: string | null
  order: number
}

export interface InvitationStory {
  id: string
  yearOrDate: string
  title: string
  story: string
  imageUrl: string | null
  order: number
}

/**
 * Alias representatif untuk generalisasi Story / Linimasa Acara (Issue #32)
 */
export type ApiStory = InvitationStory
export type ApiLoveStory = InvitationStory

export type ApiEventCategory = 'WEDDING' | 'KHITANAN' | 'RASULAN' | 'AQIQAH';
export type CelebrantGender = 'MALE' | 'FEMALE';

/** Data subjek/tokoh utama acara non-wedding (Khitanan, Rasulan, Aqiqah) */
export interface CelebrantData {
  id?: string;
  name: string;
  nickname?: string | null;
  fatherName: string;
  motherName: string;
  gender?: CelebrantGender | null;
  birthDate?: string | null;
  childOrder?: number | null;
}

/** Payload pembuatan/pembaruan data celebrant */
export interface CelebrantInput {
  name: string;
  nickname?: string | null;
  fatherName: string;
  motherName: string;
  gender?: CelebrantGender | null;
  birthDate?: string | null;
  childOrder?: number | null;
}

/** GET /invitations/:id  →  data */
export interface ApiInvitation {
  id: string;
  title: string;
  slug: string;
  eventCategory?: ApiEventCategory | null;
  status: ApiInvitationStatus;
  showCouples?: boolean;
  showCelebrant?: boolean;
  celebrant?: CelebrantData | null;
  publishedAt: string | null;
  eventDate: string | null;
  eventTime: string | null;
  venue: string | null;
  address: string | null;
  additionalInfo: unknown;
  couples: ApiCouple[];
  template: { id: string; name: string; slug: string } | null;
  galleryPhotos: ApiGalleryPhoto[];
  loveStories: ApiLoveStory[];
  giftAccounts?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type: string;
    qrCodeUrl?: string | null;
  }[];
  giftAddress?: string | null;
}

/**
 * Data undangan publik yang sudah siap tampil, diteruskan sebagai satu
 * props objek ke komponen template. Bentuknya mengikuti nilai kembalian
 * `usePublicInvitation()` agar refactor tidak mengubah perilaku.
 */
export interface PublicInvitationViewModel {
  slug: string;
  id: string;
invitation: ApiInvitation | null;
eventCategory: ApiEventCategory;
showCouples: boolean;
showCelebrant: boolean;
celebrant: CelebrantData | null;
eventLabel: string;
displayName: string;
groom: ApiCouple | null;
  bride: ApiCouple | null;
  groomName: string;
  brideName: string;
  coupleNames: string;
  eventDateText: string;
  eventDate: string | null;
  eventTime: string;
  venue: string;
  address: string;
  galleryPhotos: ApiGalleryPhoto[];
  loveStories: ApiLoveStory[];
  giftAccounts?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type: string;
    qrCodeUrl?: string | null;
  }[];
  giftAddress?: string | null;
  templateId: string;
  templateSlug: string;
}

/** Body untuk POST /invitations dan PATCH /invitations/:id */
export interface CoupleInputPayload {
  type: ApiCoupleType;
  name: string;
  fatherName: string;
  motherName: string;
}

export interface InvitationPayload {
  title: string;
  slug: string;
  eventCategory?: ApiEventCategory;
  couples?: CoupleInputPayload[];
  celebrant?: CelebrantInput;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  address?: string;
  additionalInfo?: { note?: string; dressCode?: string; healthProtocol?: string };
  templateId?: string;
}

/** PATCH /invitations/:id — semua field opsional */
export type InvitationUpdatePayload = Partial<InvitationPayload>;

/** GET /dashboard  →  data */
export interface ApiDashboardInvitationItem {
  id: string;
  title: string;
  slug: string;
  status: ApiInvitationStatus;
  eventDate: string | null;
  eventTime: string | null;
  venue: string | null;
  address: string | null;
  templateThumbnail: string | null;
  totalGuests: number;
  totalCheckedIn: number;
  checkInPercentage: number;
  eventCategory?: ApiEventCategory | null;
  celebrantName?: string | null;
}

export interface DashboardApiData {
  user: { fullName: string; planTier: ApiPlanTier };
  stats: {
    totalInvitations: number;
    totalGuests: number;
    totalCheckedIn: number;
  };
  invitations: ApiDashboardInvitationItem[];
}

/** GET /invitations/:id/guests/stats  →  data */
export interface GuestStatsApiData {
  totalGuests: number;
  totalAttended: number;
  totalPending: number;
  totalPaxExpected: number;
  totalPaxActual: number;
  byCategory: Record<string, { total: number; attended: number }>;
}

/** GET /invitations/:id/rsvps/stats  →  data */
export interface RsvpStatsApiData {
  totalGuests: number;
  totalResponded: number;
  totalPending: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPaxConfirmed: number;
}

/** Status kehadiran tamu. Backend hanya mengenal dua nilai ini. */
export type ApiRsvpStatus = 'CONFIRMED' | 'DECLINED'

/** Satu item ucapan dari endpoint publik buku ucapan. */
export interface ApiWishItem {
  id: string
  guestName: string
  status: ApiRsvpStatus
  message: string
  createdAt: string
}

/** Data yang dikirim tamu saat mengisi konfirmasi kehadiran. */
export interface RsvpSubmitPayload {
  name: string
  status: ApiRsvpStatus
  message?: string
  reservation?: number
  phone?: string
  email?: string
  qrCode?: string
}

/** GET /invitations/:invitationId/guests  →  data[] */
export interface ApiGuestItem {
  id: string
  name: string
  category: string | null
  phone: string | null
  email: string | null
  notes: string | null
  qrCode: string
  paxCount: number
  paxActual: number | null
  isAttended: boolean
  checkedInAt: string | null
  checkedOutAt: string | null
  invitationId: string
  invitationUrl: string
  whatsappShareUrl: string | null
  /** Link wa.me tanpa nomor tujuan; selalu ada meski tamu tak punya nomor HP */
  whatsappUniversalShareUrl: string
  createdAt: string
  updatedAt: string
}

/** Body untuk POST/PATCH /invitations/:invitationId/guests */
export interface GuestPayload {
  name: string
  category?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  paxCount?: number
}

/** Body untuk POST /invitations/:invitationId/guests/bulk (maks 500 tamu) */
export interface BulkGuestPayload {
  guests: GuestPayload[]
}

/** Response POST /invitations/:invitationId/guests/bulk */
export interface BulkCreateGuestResult {
  count?: number
  guests?: ApiGuestItem[]
}

/** Response GET /invitations/:invitationId/guests/:guestId/share */
export interface GuestShareData {
  guestId: string
  guestName: string
  phone: string | null
  email: string | null
  qrCode: string
  invitationUrl: string
  shareMessage: string
  whatsappShareUrl: string
  whatsappUniversalShareUrl: string
}

/** Response POST /invitations/:invitationId/guests/:guestId/send-email */
export interface SendEmailResponse {
  guestId: string
  guestName: string
  email: string
}

export interface BulkSendEmailResult {
  guestId: string
  guestName: string
  email: string
  success: boolean
  error?: string
}

/** Response POST /invitations/:invitationId/guests/send-email-bulk */
export interface BulkSendEmailResponse {
  totalTargeted: number
  totalSent: number
  totalFailed: number
  results: BulkSendEmailResult[]
}

/** GET /invitations/:invitationId/rsvps  →  data[] */
export interface ApiRsvpItem {
  id: string
  status: ApiRsvpStatus
  reservation: number
  message: string | null
  guestId: string
  guestName: string
  guestCategory: string | null
  guestPhone: string | null
  guestEmail: string | null
  invitationId: string
  createdAt: string
  updatedAt: string
}

/** GET /templates  dan  GET /templates/:slug  →  data */
export interface ApiTemplateItem {
  id: string
  name: string
  slug: string
  tier: ApiPlanTier
  /** Kategori acara; backend memberi default WEDDING */
  eventCategory: ApiEventCategory
  previewImageUrl: string
  isActive: boolean
  /** true bila paket langganan user cukup untuk memakai template ini */
  isAccessible: boolean
}

/** GET /users/me  →  data */
export interface ApiUserProfile {
  id: string
  fullName: string
  email: string
  role: string
  planTier: ApiPlanTier
  createdAt: string
}

/** Body untuk POST /invitations/:invitationId/guests/check-in */
export interface CheckInPayload {
  qrCode?: string
  guestId?: string
  paxActual?: number
}

/** Body untuk POST /invitations/:invitationId/guests/check-out */
export interface CheckOutPayload {
  qrCode?: string
  guestId?: string
}

/** 3 Kategori utama bantuan buwuh */
export const BUWUHAN_CATEGORIES = ['Uang', 'Beras', 'Barang'] as const
export type BuwuhanCategory = (typeof BUWUHAN_CATEGORIES)[number]

/** Satuan item buwuh yang diizinkan backend (ALLOWED_UNITS). */
export const BUWUHAN_UNITS = [
  'transaksi', 'kg', 'gram', 'liter', 'karung',
  'ekor', 'unit', 'pack', 'box', 'orang', 'jasa',
] as const

export type BuwuhanUnit = (typeof BUWUHAN_UNITS)[number]

export interface ApiBuwuhanItem {
  id: string
  buwuhanId: string
  itemName: string
  quantity: number
  unit: BuwuhanUnit
  category: string | null
  estimatedValue: number | null
  createdAt: string
}

/** GET /invitations/:id/buwuhans → data[] */
export interface ApiBuwuhan {
  id: string
  invitationId: string | null
  invitationTitle?: string | null
  giverName: string
  giverAddress: string | null
  note: string | null
  receivedAt: string
  createdAt: string
  updatedAt: string
  recordedByMemberId?: string | null
  recordedBy?: {
    id?: string | null
    memberId?: string | null
    name?: string | null
  } | null
  items: ApiBuwuhanItem[]
}

/** GET /invitations/:id/buwuhans/summary → data */
export interface ApiBuwuhanSummary {
  totalItems: number
  totalTransactions: number
  totalEstimatedValue: number
  totalItemsThisMonth: number
  topItem: { itemName: string; totalQuantity: number; unit: string } | null
}

/** Body untuk POST dan PATCH buwuhan */
export interface BuwuhanItemPayload {
  itemName: string
  quantity: number
  unit: BuwuhanUnit
  category?: string | null
  estimatedValue?: number | null
}

export interface BuwuhanPayload {
  giverName: string
  giverAddress?: string | null
  note?: string | null
  receivedAt?: string
  invitationId?: string | null
  invitationTitle?: string | null
  items: BuwuhanItemPayload[]
}

/** GET /buwuhans → data[] (lintas semua undangan milik pengguna) */
export interface ApiOwnerBuwuhan extends ApiBuwuhan {
  invitationTitle: string
  invitationSlug: string
}