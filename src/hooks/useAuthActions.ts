import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BackendSuccessEnvelope } from '@/types/auth'

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface VerifyEmailPayload {
  token: string
}

export interface ResendVerificationPayload {
  email?: string
}

/**
 * Hook untuk mengajukan permintaan reset password (POST /auth/forgot-password).
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const res = await api.post<BackendSuccessEnvelope<{ success: boolean; message?: string }>>(
        '/auth/forgot-password',
        payload,
      )
      return res.data?.data ?? { success: true }
    },
  })
}

/**
 * Hook untuk mengatur ulang password dengan token (POST /auth/reset-password).
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const res = await api.post<BackendSuccessEnvelope<{ success: boolean; message?: string }>>(
        '/auth/reset-password',
        payload,
      )
      return res.data?.data ?? { success: true }
    },
  })
}

/**
 * Hook untuk memverifikasi email pengguna baru (POST /auth/verify-email atau GET /auth/verify-email/:token).
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (payload: VerifyEmailPayload) => {
      try {
        const res = await api.post<BackendSuccessEnvelope<{ success: boolean; message?: string }>>(
          '/auth/verify-email',
          payload,
        )
        return res.data?.data ?? { success: true }
      } catch {
        // Coba alternatif format GET bila backend menggunakan rute GET /auth/verify-email/:token
        const res = await api.get<BackendSuccessEnvelope<{ success: boolean; message?: string }>>(
          `/auth/verify-email/${encodeURIComponent(payload.token)}`,
        )
        return res.data?.data ?? { success: true }
      }
    },
  })
}

/**
 * Hook untuk mengirim ulang email verifikasi (POST /auth/resend-verification).
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async (payload: ResendVerificationPayload) => {
      const res = await api.post<BackendSuccessEnvelope<{ success: boolean; message?: string }>>(
        '/auth/resend-verification',
        payload,
      )
      return res.data?.data ?? { success: true }
    },
  })
}
