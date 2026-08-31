export type ApiInvitationStatus = "DRAFT" | "ACTIVE" | "COMPLETED";
export type ApiCoupleType = "BRIDE" | "GROOM";
export type ApiPlanTier = "FREE" | "PRO" | "MAX";

export interface ApiCouple {
  type: string;
  name: string;
  fatherName: string;
  motherName: string;
}

export interface ApiGalleryPhoto {
  id: string
  imageUrl: string
  caption: string | null
  order: number
}

export interface ApiLoveStory {
  id: string
  yearOrDate: string
  title: string
  story: string
  imageUrl: string | null
  order: number
}

/** GET /invitations/:id  →  data */
export interface ApiInvitation {
  id: string;
  title: string;
  slug: string;
  status: ApiInvitationStatus;
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
  couples: CoupleInputPayload[];
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  address?: string;
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