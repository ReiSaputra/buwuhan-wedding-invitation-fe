import type { InvitationDetail, ActivityLog } from '@/types/dashboard'

// TODO: ganti dengan useQuery(['invitation', id]) → fetchData<InvitationDetail>(`/invitations/${id}`)
export function useInvitationDetail(id: string) {
  const invitation: InvitationDetail = {
    id,
    slug: 'janpiter-yudi',
    panelName: 'Xavier',
    coupleName: 'Janpiter & Yudi',
    eventDate: '2026-01-12',
    guestCount: 1000,
    confirmedCount: 731,
    buwuhTotal: 9000000,
  }

  const activities: ActivityLog[] = [
    {
      id: 'a1',
      message: 'Siti telah mengkonfirmasi untuk hadir',
      createdAt: '10 menit yang lalu',
      detail: 'Siti membawa 2 orang. Catatan: "Selamat ya, semoga bahagia selalu!"',
    },
    {
      id: 'a2',
      message: 'Budi mengirim ucapan',
      createdAt: '1 jam yang lalu',
      detail: 'Barakallahu lakuma wa baraka alaikuma.',
    },
  ]

  return { invitation, activities, isLoading: false }
}