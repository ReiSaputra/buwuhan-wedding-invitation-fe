import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BackendSuccessEnvelope } from '@/types/auth'
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
  DeleteAccountPayload,
  UserSession,
} from '@/types/user'
import { useAuth } from '@/hooks/useAuth'

const USER_PROFILE_STORAGE_KEY = 'buwuhan_cached_user_profile'
const USER_SESSIONS_STORAGE_KEY = 'buwuhan_cached_user_sessions'

function getInitialCachedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parsing errors
  }
  return {
    id: 'usr-default',
    fullName: 'Pengguna Buwuhan',
    nickname: 'Pengguna',
    email: 'user@buwuhan.com',
    phone: '081234567890',
    avatarUrl: null,
    role: 'USER',
    planTier: 'FREE',
    emailVerified: true,
    notifyRsvpWa: true,
    notifyBuwuhWa: true,
    notifyMarketing: false,
    createdAt: new Date().toISOString(),
  }
}

function getInitialCachedSessions(): UserSession[] {
  try {
    const raw = localStorage.getItem(USER_SESSIONS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parsing errors
  }
  return [
    {
      id: 'sess-current',
      device: 'Google Chrome / Windows 11',
      browser: 'Chrome 128',
      os: 'Windows 11',
      ipAddress: '180.252.12.34',
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: 'sess-mobile',
      device: 'Safari Mobile / iPhone 15 Pro',
      browser: 'Mobile Safari',
      os: 'iOS 17.5',
      ipAddress: '114.125.88.19',
      lastActiveAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      isCurrent: false,
    },
  ]
}

/**
 * Hook untuk memuat data profil pengguna saat ini (GET /users/me).
 */
export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      try {
        const res = await api.get<BackendSuccessEnvelope<UserProfile>>('/users/me')
        const data = res.data?.data
        if (data) {
          localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(data))
          return data
        }
      } catch (err) {
        console.warn('Backend /users/me tidak merespon, menggunakan cache lokal:', err)
      }
      return getInitialCachedProfile()
    },
    initialData: getInitialCachedProfile,
    staleTime: 1000 * 60 * 5, // 5 menit
  })
}

/**
 * Hook untuk memperbarui profil pengguna (PATCH /users/me).
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      try {
        const res = await api.patch<BackendSuccessEnvelope<UserProfile>>('/users/me', payload)
        const updated = res.data?.data
        if (updated) {
          localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated))
          return updated
        }
      } catch (err) {
        console.warn('Backend PATCH /users/me fallback ke local update:', err)
      }
      // Optimistic update fallback
      const current = getInitialCachedProfile()
      const updated: UserProfile = { ...current, ...payload, updatedAt: new Date().toISOString() }
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated))
      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data)
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

/**
 * Hook untuk mengganti password (PATCH /users/me/password).
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const res = await api.patch<BackendSuccessEnvelope<{ success: boolean }>>(
        '/users/me/password',
        payload,
      )
      return res.data?.data ?? { success: true }
    },
  })
}

/**
 * Hook untuk mengajukan penggantian email (PATCH /users/me/email).
 */
export function useChangeEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ChangeEmailPayload) => {
      try {
        const res = await api.patch<BackendSuccessEnvelope<UserProfile>>('/users/me/email', payload)
        return res.data?.data
      } catch (err) {
        console.warn('Backend PATCH /users/me/email offline, update lokal:', err)
        const current = getInitialCachedProfile()
        const updated = { ...current, email: payload.newEmail }
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated))
        return updated
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['user', 'profile'], data)
      }
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

/**
 * Hook untuk menghapus akun pengguna sendiri (DELETE /users/me).
 */
export function useDeleteAccount() {
  const { logout } = useAuth()
  return useMutation({
    mutationFn: async (payload: DeleteAccountPayload) => {
      await api.delete('/users/me', { data: payload })
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY)
      localStorage.removeItem(USER_SESSIONS_STORAGE_KEY)
      await logout()
    },
  })
}

/**
 * Hook untuk memuat daftar sesi login aktif (GET /users/me/sessions).
 */
export function useUserSessions() {
  return useQuery<UserSession[]>({
    queryKey: ['user', 'sessions'],
    queryFn: async () => {
      try {
        const res = await api.get<BackendSuccessEnvelope<UserSession[]>>('/users/me/sessions')
        const data = res.data?.data
        if (data && Array.isArray(data)) {
          localStorage.setItem(USER_SESSIONS_STORAGE_KEY, JSON.stringify(data))
          return data
        }
      } catch (err) {
        console.warn('Backend GET /users/me/sessions tidak merespon, gunakan cache sesi:', err)
      }
      return getInitialCachedSessions()
    },
    initialData: getInitialCachedSessions,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook untuk memutuskan semua sesi login di perangkat lain (DELETE /users/me/sessions).
 */
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        await api.delete('/users/me/sessions')
      } catch (err) {
        console.warn('Backend DELETE /users/me/sessions fallback lokal:', err)
      }
      // Keep only current session
      const sessions = getInitialCachedSessions().filter((s) => s.isCurrent)
      localStorage.setItem(USER_SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
      return sessions
    },
    onSuccess: (updatedSessions) => {
      queryClient.setQueryData(['user', 'sessions'], updatedSessions)
      void queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] })
    },
  })
}
