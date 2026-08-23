import { useMemo } from 'react'
import type { RsvpGuest, RsvpStats } from '@/types/panel'

const MOCK_GUESTS: RsvpGuest[] = [
  { id: 'r1', name: 'Budi Santoso', phone: '081234567890', category: 'Keluarga', headcount: 2, status: 'HADIR' },
  { id: 'r2', name: 'Siti Aminah', phone: '081987654321', category: 'Rekan Kerja', headcount: null, status: 'BELUM_KONFIRMASI' },
  { id: 'r3', name: 'Keluarga Wijaya', phone: '081122334455', category: 'Keluarga', headcount: 4, status: 'HADIR' },
  { id: 'r4', name: 'Andi Pratama', phone: '081223344556', category: 'Teman Sekolah', headcount: null, status: 'TIDAK_HADIR' },
  { id: 'r5', name: 'Dr. Handoko', phone: '081277889900', category: 'Dosen', headcount: 2, status: 'HADIR' },
  { id: 'r6', name: 'Citra Lestari', phone: '081355667788', category: 'Sahabat', headcount: 1, status: 'HADIR' },
  { id: 'r7', name: 'H. Ahmad Fauzi', phone: '081399887766', category: 'VIP', headcount: 5, status: 'HADIR' },
  { id: 'r8', name: 'Rina Marlina', phone: '081744556677', category: 'Rekan Kerja', headcount: null, status: 'BELUM_KONFIRMASI' },
  { id: 'r9', name: 'Pak Slamet', phone: '081566778899', category: 'Tetangga', headcount: 2, status: 'HADIR' },
  { id: 'r10', name: 'Dewi Anggraini', phone: '081611223344', category: 'Sahabat', headcount: null, status: 'TIDAK_HADIR' },
  { id: 'r11', name: 'Keluarga Suryono', phone: '081833445566', category: 'Keluarga', headcount: 3, status: 'HADIR' },
  { id: 'r12', name: 'Tono Wijaya', phone: '081955667700', category: 'Teman Sekolah', headcount: null, status: 'BELUM_KONFIRMASI' },
]

/**
 * Hook pengambil daftar tamu beserta status RSVP untuk sebuah undangan.
 *
 * Parameter diberi awalan garis bawah karena belum dipakai selama data masih
 * mock. TypeScript memperbolehkan parameter tak terpakai hanya bila namanya
 * dimulai dengan `_` (aturan `noUnusedParameters`). Setelah backend siap,
 * hapus garis bawahnya dan pakai sebagai queryKey React Query.
 *
 * @param _invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `guests`, rekap `stats`, dan flag `isLoading`
 */
export function useRsvpGuests(_invitationId: string) {
  const guests = MOCK_GUESTS

  // Statistik dihitung dari daftar, bukan ditulis manual, supaya angka kartu
  // tidak pernah berbeda dengan isi tabel.
  const stats = useMemo<RsvpStats>(
    () => ({
      total: guests.length,
      hadir: guests.filter((guest) => guest.status === 'HADIR').length,
      tidakHadir: guests.filter((guest) => guest.status === 'TIDAK_HADIR').length,
      belumKonfirmasi: guests.filter((guest) => guest.status === 'BELUM_KONFIRMASI').length,
    }),
    [guests],
  )

  return { guests, stats, isLoading: false }
}
