import { createContext } from 'react'
import type { AuthUser, LoginInput, RegisterInput } from '@/types/auth'

/**
 * Interface data dan metode yang diekspos oleh AuthContext ke seluruh aplikasi.
 */
export type AuthContextType = {
  /** Data profil user yang sedang login, atau null jika anonim */
  user: AuthUser | null
  /** Access Token (JWT) yang tersimpan di memori */
  accessToken: string | null
  /** Status apakah sesi user terotentikasi */
  isAuthenticated: boolean
  /** Status apakah pengecekan sesi awal (silent refresh) sedang berlangsung */
  isLoading: boolean
  /** Fungsi untuk proses masuk (Sign In), mengembalikan data AuthUser */
  login: (input: LoginInput) => Promise<AuthUser>
  /** Fungsi untuk proses pendaftaran akun (Sign Up) */
  register: (input: RegisterInput) => Promise<void>
  /** Fungsi untuk keluar (Sign Out) */
  logout: () => Promise<void>
  /** Fungsi untuk memperbarui token sesi secara manual jika dibutuhkan */
  refreshSession: () => Promise<boolean>
}

/**
 * Konteks autentikasi aplikasi.
 * Sengaja dipisahkan dari AuthProvider agar berkas provider hanya
 * mengekspor komponen, sehingga Fast Refresh Vite tetap berfungsi.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)