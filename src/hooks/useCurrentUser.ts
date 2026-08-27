import { useAuth } from '@/hooks/useAuth'
import type { CurrentUser } from '@/types/dashboard'

/**
 * Custom React Hook untuk mendapatkan data profil user yang sedang aktif login di sesi aplikasi.
 * Terintegrasi langsung dengan AuthContext dan backend session.
 * 
 * @returns Objek profil CurrentUser berisi ID, nama, email, peran, dan paket aktif
 */
export function useCurrentUser(): CurrentUser {
  const { user } = useAuth()

  if (user) {
    return {
      id: user.id,
      fullName: user.fullName || 'Pengguna Buwuhan',
      nickname: user.nickname || user.fullName?.split(' ')[0] || 'User',
      role: user.role || 'Penyelenggara Undangan',
      avatarUrl: user.avatarUrl ?? null,
      plan: user.plan || 'PRO',
      email: user.email,
    }
  }

  return {
    id: 'guest',
    fullName: 'Tamu Pengunjung',
    nickname: 'Tamu',
    role: 'Pengguna',
    avatarUrl: null,
    plan: 'FREE',
    email: '',
  }
}