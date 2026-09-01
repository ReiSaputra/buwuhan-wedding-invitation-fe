import { useAuth } from '@/hooks/useAuth'
import type { CurrentUser } from '@/types/dashboard'

const GUEST_USER: CurrentUser = {
  id: 'guest',
  fullName: 'Tamu Pengunjung',
  nickname: 'Tamu',
  role: 'Pengguna',
  avatarUrl: null,
  plan: 'FREE',
  email: '',
}

/**
 * Custom React Hook untuk mendapatkan profil pengguna yang sedang login.
 * Sumber datanya adalah AuthContext, yang kini mengambil profil langsung
 * dari endpoint GET /users/me.
 *
 * @returns Objek CurrentUser berisi ID, nama, email, peran, dan paket aktif
 */
export function useCurrentUser(): CurrentUser {
  const { user } = useAuth()

  if (!user) return GUEST_USER

  return {
    id: user.id,
    fullName: user.fullName || 'Pengguna Buwuhan',
    nickname: user.nickname || user.fullName?.split(' ')[0] || 'Pengguna',
    role: user.role || 'Penyelenggara Undangan',
    avatarUrl: user.avatarUrl ?? null,
    plan: user.plan ?? 'FREE',
    email: user.email,
  }
}