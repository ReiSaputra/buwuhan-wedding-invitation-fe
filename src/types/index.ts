export type Attendance = "HADIR" | "TIDAK_HADIR" | "RAGU";

export type GuestCategory = "KELUARGA" | "TEMAN" | "KERJA" | "TETANGGA" | "VIP";

export type Rsvp = {
  id: string;
  attendance: Attendance;
  headcount: number;
  note: string | null;
};

export type Guest = {
  id: string;
  name: string;
  category: GuestCategory;
  quota: number;
  rsvp: Rsvp | null;
};

export type WeddingEvent = {
  id: string;
  name: string;
  startAt: string;
  endAt: string | null;
  venueName: string;
  address: string;
  mapsUrl: string | null;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoUrl: string | null;
};

export type GalleryItem = {
  id: string;
  url: string;
  thumbUrl: string | null;
  caption: string | null;
};

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type Invitation = {
  couple: {
    groomName: string;
    groomFullName: string;
    groomFather: string;
    groomMother: string;
    brideName: string;
    brideFullName: string;
    brideFather: string;
    brideMother: string;
  };
  events: WeddingEvent[];
  gallery: GalleryItem[];
  bankAccounts: BankAccount[];
};

/** Bentuk response standar dari backend Node.js kamu */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export * from './auth';

