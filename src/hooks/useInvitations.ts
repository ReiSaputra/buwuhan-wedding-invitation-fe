import type { InvitationSummary, DashboardStats } from '@/types/dashboard'

// TODO: ganti dengan useQuery(['invitations']) → fetchData<InvitationSummary[]>('/invitations')
const MOCK: InvitationSummary[] = [
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
  },
]

export function useInvitations() {
  const invitations = MOCK

  const stats: DashboardStats = {
    totalInvitations: invitations.length,
    totalGuests: invitations.reduce((sum, i) => sum + i.guestCount, 0),
    totalCheckedIn: invitations.reduce((sum, i) => sum + i.checkedInCount, 0),
  }

  return { invitations, stats, isLoading: false }
}