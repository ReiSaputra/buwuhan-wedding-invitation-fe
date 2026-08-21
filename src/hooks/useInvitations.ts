import type { InvitationSummary, DashboardStats } from '@/types/dashboard'

/**
 * Data mock daftar undangan untuk simulasi frontend.
 * Dapat dengan mudah diganti dengan query API backend (`useQuery(['invitations'])`).
 */
const MOCK_INVITATIONS: InvitationSummary[] = [
  {
    id: '1',
    slug: 'han-saputra',
    coupleName: 'Han & Saputra',
    eventDate: '2026-01-18',
    eventTime: '07:00',
    thumbnailUrl: '/images/rings.jpg',
    status: 'PUBLISHED',
    guestCount: 1000,
    checkedInCount: 731,
    themeName: 'Royal Javanese Elegance',
  },
  {
    id: '2',
    slug: 'han-saputra-2',
    coupleName: 'Han & Saputra',
    eventDate: '2026-01-18',
    eventTime: '07:00',
    thumbnailUrl: '/images/rings.jpg',
    status: 'DRAFT',
    guestCount: 240,
    checkedInCount: 0,
    themeName: 'Modern Minimalist Botanical',
  },
]

/**
 * Custom React Hook untuk mengambil daftar undangan digital pengguna dan ringkasan metrik statistik.
 * 
 * @returns Objek berisi daftar `invitations`, metrik `stats`, dan status loading `isLoading`
 * 
 * @example
 * const { invitations, stats, isLoading } = useInvitations()
 */
export function useInvitations() {
  const invitations = MOCK_INVITATIONS

  const stats: DashboardStats = {
    totalInvitations: invitations.length,
    totalGuests: invitations.reduce((sum, i) => sum + i.guestCount, 0),
    totalCheckedIn: invitations.reduce((sum, i) => sum + i.checkedInCount, 0),
  }

  return { invitations, stats, isLoading: false }
}