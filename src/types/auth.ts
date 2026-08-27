/**
 * Tipe data profil pengguna yang terautentikasi.
 */
export type AuthUser = {
  id: string
  fullName: string
  nickname?: string
  email: string
  role?: string
  avatarUrl?: string | null
  plan?: 'FREE' | 'PRO' | 'MAX'
}

/**
 * Data payload saat proses pendaftaran akun baru (Sign Up).
 */
export type RegisterInput = {
  fullName: string
  email: string
  password: string
}

/**
 * Data payload saat proses masuk akun (Sign In).
 */
export type LoginInput = {
  email: string
  password: string
}

/**
 * Payload data di dalam envelope response login.
 */
export type LoginResponseData = {
  id: string
  fullName: string
  email: string
  accessToken: string
  user?: AuthUser
}

/**
 * Payload data di dalam envelope response register.
 */
export type RegisterResponseData = {
  id: string
  fullName: string
  email: string
}

/**
 * Payload data di dalam envelope response refresh-token.
 */
export type RefreshTokenResponseData = {
  accessToken: string
}


/**
 * Amplop standar respon sukses backend Buwuhan:
 * { message, status, data }
 */
export type BackendSuccessEnvelope<T> = {
  message: string
  status: number
  data: T
}

/**
 * Amplop standar respon galat (error) backend Buwuhan:
 * { success: false, message: string }
 */
export type BackendErrorEnvelope = {
  success: boolean
  message: string
}
