import type { CurrentUser } from '@/types/dashboard'

// TODO: ganti dengan useQuery(['me']) → fetchData<CurrentUser>('/auth/me')
export function useCurrentUser(): CurrentUser {
  return {
    id: 'mock-1',
    fullName: 'John Doe',
    nickname: 'Xavier',
    role: 'Admin',
    avatarUrl: null,
    plan: 'FREE',
  }
}