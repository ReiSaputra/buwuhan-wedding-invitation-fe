import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { api, setAccessToken as setGlobalAccessToken, setOnAuthFailed } from '@/lib/api'
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  LoginResponseData,
  RegisterResponseData,
  RefreshTokenResponseData,
  BackendSuccessEnvelope,
} from '@/types/auth'


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
  /** Fungsi untuk proses masuk (Sign In) */
  login: (input: LoginInput) => Promise<void>
  /** Fungsi untuk proses pendaftaran akun (Sign Up) */
  register: (input: RegisterInput) => Promise<void>
  /** Fungsi untuk keluar (Sign Out) */
  logout: () => Promise<void>
  /** Fungsi untuk memperbarui token sesi secara manual jika dibutuhkan */
  refreshSession: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Ekstraksi payload user dari JWT Access Token sebagai fallback
 * jika backend hanya mengembalikan token string tanpa objek user utuh.
 * 
 * @param token - String JWT access token
 * @returns Parsed user object atau null jika tidak valid
 */
function parseJwtUser(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    const payload = JSON.parse(jsonPayload)
    let cachedUser: Partial<AuthUser> = {}
    try {
      const cachedStr = localStorage.getItem('buwuhan_cached_user')
      if (cachedStr) cachedUser = JSON.parse(cachedStr)
    } catch {}

    return {
      id: payload.id || payload.sub || cachedUser.id || 'user-id',
      email: cachedUser.email || '',
      fullName: cachedUser.fullName || 'Pengguna Buwuhan',
      role: payload.role || cachedUser.role || 'USER',
      plan: payload.planTier || cachedUser.plan || 'FREE',
    }
  } catch {
    return null
  }
}

/**
 * Provider Konteks Autentikasi (AuthProvider).
 * Mengelola siklus hidup sesi pengguna di memori:
 * - Menyimpan accessToken dalam state React (bukan di localStorage/sessionStorage demi keamanan XSS).
 * - Melakukan silent session restoration otomatis saat aplikasi dibuka melalui cookie httpOnly.
 * - Menyediakan fungsi login, register, logout terpusat.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /**
   * Menyimpan access token ke state lokal komponen dan memori global Axios.
   */
  const updateAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token)
    setGlobalAccessToken(token)
  }, [])

  /**
   * Memulihkan sesi pengguna dengan memanggil refresh token (menggunakan cookie httpOnly).
   * 
   * @returns true jika berhasil memulihkan sesi, false jika gagal/belum login
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.post<BackendSuccessEnvelope<RefreshTokenResponseData>>(
        '/auth/refresh-token',
        {},
      )

      const token = res.data?.data?.accessToken
      if (!token) return false

      updateAccessToken(token)

      const parsed = parseJwtUser(token)
      if (parsed) setUser(parsed)

      return true
    } catch {
      updateAccessToken(null)
      setUser(null)
      return false
    }
  }, [updateAccessToken])

  // Pengecekan sesi awal (silent refresh) saat aplikasi pertama kali dimuat
  useEffect(() => {
    let isMounted = true

    // Daftarkan callback jika axios interceptor gagal total me-refresh token
    setOnAuthFailed(() => {
      if (isMounted) {
        updateAccessToken(null)
        setUser(null)
      }
    })

    async function initSession() {
      try {
        await refreshSession()
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initSession()

    return () => {
      isMounted = false
    }
  }, [refreshSession, updateAccessToken])

  /**
   * Menangani proses login pengguna ke endpoint POST /auth/login.
   * 
   * @param input - Kredensial login (email, password)
   */
  const login = useCallback(
    async (input: LoginInput) => {
      const res = await api.post<BackendSuccessEnvelope<LoginResponseData>>('/auth/login', {
        email: input.email.trim(),
        password: input.password,
      })

      const data = res.data?.data
      if (!data?.accessToken) {
        throw new Error('Respon login tidak memuat accessToken')
      }

      updateAccessToken(data.accessToken)
      const userObj: AuthUser = {
        id: data.id || 'user-id',
        fullName: data.fullName || 'Pengguna Buwuhan',
        email: data.email || input.email,
        role: 'USER',
        plan: 'FREE',
      }
      try {
        localStorage.setItem('buwuhan_cached_user', JSON.stringify(userObj))
      } catch {}
      setUser(userObj)
    },
    [updateAccessToken],
  )

  /**
   * Menangani pendaftaran akun baru ke endpoint POST /auth/register.
   * 
   * @param input - Data registrasi (fullName, email, password)
   */
  const register = useCallback(
    async (input: RegisterInput) => {
      await api.post<BackendSuccessEnvelope<RegisterResponseData>>('/auth/register', {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
      })
    },
    [],
  )


  /**
   * Menangani proses logout ke endpoint POST /auth/logout.
   * Menghapus token di memori dan meminta backend membersihkan cookie httpOnly.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {})
    } catch (err) {
      console.warn('Gagal memanggil endpoint logout di backend:', err)
    } finally {
      updateAccessToken(null)
      setUser(null)
      try {
        localStorage.removeItem('buwuhan_cached_user')
      } catch {}
    }
  }, [updateAccessToken])


  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken && user),
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook bantuan untuk mengakses AuthContext di seluruh komponen.
 * 
 * @returns Objek AuthContextType
 * @throws Error jika dipanggil di luar AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>')
  }
  return context
}
