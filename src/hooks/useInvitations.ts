import { useDashboard } from '@/hooks/useDashboard'

/**
 * Custom React Hook untuk mengambil daftar undangan digital pengguna dan ringkasan metrik statistik.
 *
 * Hook ini sekarang hanya pembungkus tipis dari `useDashboard()` agar
 * komponen lama yang sudah memakai `useInvitations()` tidak perlu diubah.
 *
 * @example
 * const { invitations, stats, isLoading } = useInvitations()
 */
export function useInvitations() {
  return useDashboard()
}