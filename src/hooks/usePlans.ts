import type { PlanTier } from '@/types/dashboard'

/**
 * Daftar konfigurasi paket langganan platform Buwuhan.
 */
const PLANS: PlanTier[] = [
  {
    code: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Pilihan dasar untuk mencoba membuat undangan digital secara mandiri.',
    features: [
      '1 undangan aktif',
      'Maksimal 50 tamu',
      '10 foto galeri',
      'Kehadiran & buku ucapan dasar',
      'Watermark Buwuh Panel',

    ],
    ctaLabel: 'Mulai Gratis',
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 49000,
    description: 'Paling banyak dipilih. Sangat lengkap untuk satu acara pernikahan penuh.',
    features: [
      '3 undangan aktif',
      'Kapasitas tamu tanpa batas',
      '100 foto galeri & video',
      'Scan QR check-in resepsi',
      '3 akun petugas penerima tamu',
      'Bebas watermark / Whitelabel',
      'Catatan buwuh & export Excel',
    ],
    ctaLabel: 'Upgrade ke Pro',
    isPopular: true,
  },
  {
    code: 'MAX',
    name: 'Max',
    price: 149000,
    description: 'Untuk vendor & Wedding Organizer yang mengelola banyak acara.',
    features: [
      'Undangan aktif tanpa batas',
      'Tamu tanpa batas',
      'Galeri media tanpa batas',
      'Dukungan Custom Domain sendiri',
      'Akun petugas resepsi tanpa batas',
      'Akses seluruh tema & template premium',
      'Dukungan prioritas 24/7 via WhatsApp',
    ],
    ctaLabel: 'Pilih Paket Max',
  },
]

/**
 * Custom React Hook untuk mengambil data paket harga langganan yang tersedia.
 * 
 * @returns Objek berisi daftar `plans` dan flag `isLoading`
 */
export function usePlans() {
  return { plans: PLANS, isLoading: false }
}