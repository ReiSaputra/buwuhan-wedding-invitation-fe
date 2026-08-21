import type { PlanTier } from '@/types/dashboard'

// TODO: ganti dengan useQuery(['plans']) → fetchData<PlanTier[]>('/plans')
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
      'RSVP & buku ucapan',
      'Ada watermark Buwuh Panel',
    ],
    ctaLabel: 'Get Started',
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 49000,
    description: 'Paling banyak dipilih. Cukup untuk satu acara pernikahan penuh.',
    features: [
      '3 undangan aktif',
      'Tamu tanpa batas',
      '100 foto galeri',
      'Scan QR check-in tamu',
      '3 akun petugas',
      'Tanpa watermark',
      'Catatan buwuh & export Excel',
    ],
    ctaLabel: 'Upgrade to Pro',
    isPopular: true,
  },
  {
    code: 'MAX',
    name: 'Max',
    price: 149000,
    description: 'Untuk vendor & wedding organizer yang mengelola banyak acara.',
    features: [
      'Undangan tanpa batas',
      'Tamu tanpa batas',
      'Galeri tanpa batas',
      'Custom domain sendiri',
      'Akun petugas tanpa batas',
      'Semua template premium',
      'Prioritas dukungan (24/7)',
    ],
    ctaLabel: 'Go Max',
  },
]

export function usePlans() {
  return { plans: PLANS, isLoading: false }
}