import { useDashboard } from '@/hooks/useDashboard'

/**
 * Alias dari `useDashboard()`.
 *
 * Endpoint `GET /invitations` sengaja TIDAK dipakai karena tidak mengirim
 * jumlah tamu, jumlah check-in, maupun thumbnail template — tiga data yang
 * dibutuhkan `InvitationCard`. Semua kebutuhan daftar undangan dilayani
 * oleh `GET /dashboard`.
 *
 * @example
 * const { invitations, stats, isLoading } = useInvitations()
 */
export function useInvitations() {
  return useDashboard()
}