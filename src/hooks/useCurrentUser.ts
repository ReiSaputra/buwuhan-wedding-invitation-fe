import type { CurrentUser } from '@/types/dashboard'

/**
 * Custom React Hook untuk mendapatkan data profil user yang sedang aktif login di sesi aplikasi.
 * Siap diintegrasikan dengan TanStack React Query (`useQuery(['me'])`).
 * 
 * @returns Objek profil CurrentUser berisi ID, nama, nickname, peran, dan paket aktif
 */
export function useCurrentUser(): CurrentUser {
  return {
    id: 'mock-1',
    fullName: 'John Doe',
    nickname: 'Xavier',
    role: 'Admin Pengelola',
    avatarUrl: null,
    plan: 'FREE',
    email: 'xavier.admin@buwuhan.com',
  }
}