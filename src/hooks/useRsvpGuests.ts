import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/lib/api'
import type { ApiGuestItem, ApiRsvpItem } from '@/types/invitation-api'
import type { RsvpGuest, RsvpStats, RsvpStatus } from '@/types/panel'

/**
 * Hook pengambil daftar tamu beserta status konfirmasi kehadiran (RSVP)
 * untuk sebuah undangan.
 *
 * Menggabungkan dua endpoint karena backend hanya menyimpan baris RSVP untuk
 * tamu yang SUDAH merespons. Status 'BELUM_KONFIRMASI' diturunkan dari tamu
 * yang ada di daftar tamu tetapi belum punya baris RSVP:
 * - GET /invitations/:id/guests
 * - GET /invitations/:id/rsvps
 *
 * @param invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `guests`, rekap `stats`, dan flag status permintaan
 */
export function useRsvpGuests(invitationId: string) {
  const enabled = Boolean(invitationId)

  const guestsQuery = useQuery({
    queryKey: ['invitation', invitationId, 'guests'],
    queryFn: () => fetchData<ApiGuestItem[]>(`/invitations/${invitationId}/guests`),
    enabled,
  })

  const rsvpsQuery = useQuery({
    queryKey: ['invitation', invitationId, 'rsvps'],
    queryFn: () => fetchData<ApiRsvpItem[]>(`/invitations/${invitationId}/rsvps`),
    enabled,
  })

  const guests = useMemo<RsvpGuest[]>(() => {
    // Indeks RSVP berdasarkan guestId supaya penggabungan O(n), bukan O(n²)
    const rsvpByGuestId = new Map(
      (rsvpsQuery.data ?? []).map((rsvp) => [rsvp.guestId, rsvp]),
    )

    return (guestsQuery.data ?? []).map((guest) => {
      const rsvp = rsvpByGuestId.get(guest.id)

      const status: RsvpStatus = !rsvp
        ? 'BELUM_KONFIRMASI'
        : rsvp.status === 'CONFIRMED'
          ? 'HADIR'
          : 'TIDAK_HADIR'

      return {
        id: guest.id,
        name: guest.name,
        phone: guest.phone ?? '',
        email: guest.email ?? '',
        category: guest.category ?? 'Tanpa Kategori',
        // Jumlah pax hanya bermakna bila tamu menyatakan hadir
        headcount: rsvp && rsvp.status === 'CONFIRMED' ? rsvp.reservation : null,
        status,
      }
    })
  }, [guestsQuery.data, rsvpsQuery.data])

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

  return {
    guests,
    stats,
    isLoading: enabled && (guestsQuery.isLoading || rsvpsQuery.isLoading),
    isError: guestsQuery.isError || rsvpsQuery.isError,
  }
}