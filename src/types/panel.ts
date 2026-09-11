/**
 * Status konfirmasi kehadiran yang dikirim tamu lewat form di undangan.
 * Berbeda dengan AttendanceStatus yang mencatat kehadiran nyata di lokasi.
 */
export type RsvpStatus = 'HADIR' | 'TIDAK_HADIR' | 'BELUM_KONFIRMASI'

/**
 * Baris data tamu pada halaman Konfirmasi Kehadiran.
 */
export type RsvpGuest = {
  id: string
  name: string
  phone: string
  category: string
  /** Jumlah orang yang dibawa. null bila tamu belum konfirmasi atau menyatakan tidak hadir. */
  headcount: number | null
  status: RsvpStatus
  /** ID baris RSVP di backend. null bila tamu belum pernah merespons (tidak bisa dihapus). */
  rsvpId: string | null
}

/**
 * Rekap angka pada empat kartu statistik halaman Konfirmasi Kehadiran.
 */
export type RsvpStats = {

  total: number
  hadir: number
  tidakHadir: number
  belumKonfirmasi: number
}

/**
 * Status kehadiran aktual di lokasi acara (hasil check-in / Scan QR).
 */
export type AttendanceStatus = 'HADIR' | 'TIDAK_HADIR'

/**
 * Baris data pada Buku Tamu: catatan kehadiran nyata beserta ucapan tamu.
 */
export type GuestBookEntry = {
  id: string
  name: string
  category: string
  status: AttendanceStatus
  /** Waktu check-in dalam format ISO-8601 (misal "2026-01-18T14:30:00+07:00") */
  recordedAt: string
  /** Nomor HP tamu. */
  phone?: string
  /** Alamat email tamu untuk pengiriman undangan digital */
  email?: string
  /** Ucapan, doa restu, atau catatan khusus dari tamu */
  message?: string
}

/**
 * Rekening bank / dompet digital penerima amplop digital (Panel Pemilik).
 */
export type GiftAccount = {
  id: string
  invitationId?: string
  bankName: string
  accountNumber: string
  accountHolder: string
  type: string
  order?: number
  qrCodeUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Rekening kado & e-wallet publik yang disanitasi dari GET /public/invitations/:slug/gift-accounts
 */
export interface PublicGiftAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  type: 'BANK' | 'EWALLET' | string
  order: number
  qrCodeUrl?: string | null
}

/**
 * Payload untuk membuat atau mengubah rekening hadiah.
 */
export type GiftAccountPayload = {
  bankName: string
  accountNumber: string
  accountHolder: string
  type: string
  qrCodeUrl?: string | null
}

/**
 * Payload untuk memperbarui alamat fisik pengiriman kado.
 */
export type GiftAddressPayload = {
  giftAddress: string
}

/**
 * Jenis pemberian tamu: uang (buwuh/amplop) atau barang/kado.
 */
export type GiftKind = 'UANG' | 'BARANG'

/**
 * Baris catatan pemberian tamu pada halaman Hadiah.
 */
export type GiftRecord = {
  id: string
  invitationId?: string
  guestName: string
  kind: GiftKind
  /** Nominal rupiah. Diisi hanya bila kind === 'UANG'. */
  amount: number | null
  /** Nama barang. Diisi hanya bila kind === 'BARANG'. */
  itemName: string | null
  /** Label metode penerimaan, misal "Transfer BCA" atau "Amplop Lokasi" */
  methodLabel: string
  /** true = diterima digital (transfer), false = diterima manual di lokasi */
  isDigital: boolean
  /** Waktu pencatatan dalam format ISO-8601 */
  createdAt: string
  updatedAt?: string
}

/**
 * Payload untuk membuat atau memperbarui catatan hadiah.
 */
export type GiftPayload = {
  guestName: string
  kind: GiftKind
  amount?: number | null
  itemName?: string | null
  methodLabel: string
  isDigital?: boolean
}

/**
 * Rekap angka pada kartu statistik halaman Hadiah.
 */
export type GiftStats = {
  /** Akumulasi nominal seluruh pemberian berjenis uang */
  totalAmount: number
  /** Jumlah tamu unik yang memberi (uang maupun barang) */
  participantCount: number
  /** Jumlah kado fisik/barang yang diterima */
  physicalCount?: number
}

/**
 * Payload form "Tambah Tamu Baru" pada Buku Tamu.
 */
export type NewGuestInput = {
  name: string
  category: string
  phone?: string
  email?: string
  note?: string
}

/**
 * Daftar kategori tamu bawaan untuk dropdown form.
 * Nantinya nilai ini datang dari database per undangan.
 */
export const GUEST_CATEGORIES = [
  'Keluarga',
  'Rekan Kerja',
  'Teman Sekolah',
  'Sahabat',
  'Tetangga',
  'Dosen',
  'VIP',
] as const
