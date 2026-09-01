import type { ApiUserProfile } from '@/types/invitation-api'
import { AuthContext } from '@/contexts/auth-context'
import {
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
 * Mengambil profil pengguna yang sedang login dari endpoint GET /users/me.
 *
 * Pendekatan ini menggantikan pembacaan payload JWT secara manual dan
 * penyimpanan profil di localStorage. Selain lebih akurat (nama, email, dan
 * paket selalu terbaru), data pengguna tidak lagi tertinggal di penyimpanan
 * browser setelah pengguna keluar.
 *
 * @returns Objek AuthUser, atau null bila gagal diambil
 */
async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await api.get<BackendSuccessEnvelope<ApiUserProfile>>('/users/me')
    const profile = res.data?.data
    if (!profile) return null

    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      plan: profile.planTier,
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

      // Profil diambil dari server agar nama, email, dan paket selalu terbaru
      const profile = await fetchCurrentUser()
      if (profile) setUser(profile)

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
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email || input.email,
        role: data.role,
        plan: data.planTier,
      })
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

