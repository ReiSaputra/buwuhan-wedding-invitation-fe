import type { InvitationDetail, ActivityLog } from '@/types/dashboard'

/**
 * Custom React Hook untuk mengambil data detail sebuah undangan spesifik
 * beserta daftar linimasa aktivitas tamu terkait berdasarkan ID undangan.
 * 
 * @param id - Identifier unik dari undangan yang ingin dimuat
 * @returns Objek berisi `invitation` detail, daftar `activities`, dan flag `isLoading`
 * 
 * @example
 * const { invitation, activities } = useInvitationDetail('1')
 */
export function useInvitationDetail(id: string) {
  const invitation: InvitationDetail = {
    id,
    slug: 'han-saputra',
    panelName: 'Xavier',
    coupleName: 'Han & Saputra',
    eventDate: '2026-01-18',
    guestCount: 1000,
    confirmedCount: 731,
    buwuhTotal: 9000000,
  }

  const activities: ActivityLog[] = [
    {
      id: 'a1',
      message: 'Siti Rahmawan telah mengkonfirmasi hadir (2 Pax)',
      createdAt: '10 menit yang lalu',
      detail: 'Siti membawa 2 orang. Catatan: "Selamat ya, semoga bahagia selalu!"',
      category: 'rsvp',
    },
    {
      id: 'a2',
      message: 'Budi Santoso mengirim ucapan doa restu',
      createdAt: '1 jam yang lalu',
      detail: 'Barakallahu lakuma wa baraka alaikuma.',
      category: 'ucapan',
    },
    {
      id: 'a3',
      message: 'H. Ahmad mengirim tanda kasih amplop digital Rp 1.500.000',
      createdAt: '3 jam yang lalu',
      detail: 'Transfer Bank BCA terverifikasi.',
      category: 'hadiah',
    },
  ]

  return { invitation, activities, isLoading: false }
}