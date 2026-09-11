import type { ApiUserProfile } from '@/types/invitation-api'
import { AuthContext } from '@/contexts/auth-context'
import {
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  api,
  setAccessToken as setGlobalAccessToken,
  setOnAuthFailed,
  setOnTokenRefreshed,
  requestRefreshToken,
} from '@/lib/api'
import { instantAuthStorage } from '@/lib/instantAuthStorage'
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  LoginResponseData,
  RegisterResponseData,
  BackendSuccessEnvelope,
} from '@/types/auth'

/**
 * Mendekode payload JWT untuk mengekstrak data klaim peran (role) dan tier langganan.
 */
function parseJwtClaims(token: string): { id?: string; role?: string; planTier?: ApiUserProfile['planTier'] } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

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
   * Memulihkan sesi pengguna dengan memanggil refresh token terpusat (singleton promise).
   * 
   * @returns true jika berhasil memulihkan sesi, false jika gagal/belum login
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = await requestRefreshToken()
      if (!token) {
        updateAccessToken(null)
        setUser(null)
        return false
      }

      updateAccessToken(token)

      // Profil diambil dari server agar nama, email, dan paket selalu terbaru
      const profile = await fetchCurrentUser()
      const claims = parseJwtClaims(token)

      if (profile) {
        setUser(profile)
      } else if (claims) {
        setUser({
          id: claims.id || '',
          fullName: 'Pengguna Buwuhan',
          email: '',
          role: claims.role || 'USER',
          plan: (claims.planTier || 'FREE') as AuthUser['plan'],
        })
      }

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

    // Sinkronkan state React jika Axios interceptor me-refresh token di background
    setOnTokenRefreshed((newToken) => {
      if (isMounted) {
        setAccessTokenState(newToken)
      }
    })

    // Daftarkan callback jika axios interceptor gagal total me-refresh token
    setOnAuthFailed(() => {
      if (isMounted) {
        updateAccessToken(null)
        setUser(null)
      }
    })

    async function initSession() {
      try {
        const isInstant = instantAuthStorage.isInstantAccess()
        const instantToken = instantAuthStorage.getToken()
        const instantMemberName = instantAuthStorage.getMemberName() || 'Petugas'
        const instantMemberId = instantAuthStorage.getMemberId() || ''

        if (isInstant && instantToken) {
          updateAccessToken(instantToken)
          setUser({
            id: instantMemberId,
            fullName: instantMemberName,
            email: '',
            role: 'USER',
            plan: 'FREE',
          })
          return
        }

        await refreshSession()
      } catch {
        // Abaikan error pada silent refresh awal
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initSession()

    return () => {
      isMounted = false
      setOnTokenRefreshed(null)
      setOnAuthFailed(null)
    }
  }, [refreshSession, updateAccessToken])

  /**
   * Menangani proses login pengguna ke endpoint POST /auth/login.
   * 
   * @param input - Kredensial login (email, password)
   */
  const login = useCallback(
    async (input: LoginInput) => {
      // Bersihkan sesi instan jika ada sebelum login dengan akun reguler
      instantAuthStorage.clearSession()

      const res = await api.post<BackendSuccessEnvelope<LoginResponseData>>('/auth/login', {
        email: input.email.trim(),
        password: input.password,
      })

      const data = res.data?.data
      if (!data?.accessToken) {
        throw new Error('Respon login tidak memuat accessToken')
      }

      updateAccessToken(data.accessToken)
      const claims = parseJwtClaims(data.accessToken)

      // Ambil profil lengkap dari endpoint /users/me
      const profile = await fetchCurrentUser()

      const userObj: AuthUser = {
        id: profile?.id || data.id,
        fullName: profile?.fullName || data.fullName,
        email: profile?.email || data.email || input.email,
        role: profile?.role || claims?.role || (data as { role?: string }).role || 'USER',
        plan: (profile?.plan || claims?.planTier || (data as { planTier?: string }).planTier || 'FREE') as AuthUser['plan'],
      }
      setUser(userObj)
      return userObj
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
      instantAuthStorage.clearSession()

      await api.post<BackendSuccessEnvelope<RegisterResponseData>>('/auth/register', {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
      })
    },
    [],
  )


  /**
   * Menetapkan sesi autentikasi kustom (Magic Link petugas instan).
   */
  const setAuthSession = useCallback((token: string, userObj: AuthUser) => {
    updateAccessToken(token)
    setUser(userObj)
  }, [updateAccessToken])

  /**
   * Menangani proses logout ke endpoint POST /auth/logout.
   * Menghapus token di memori dan meminta backend membersihkan cookie httpOnly.
   */
  const logout = useCallback(async () => {
    try {
      const isInstant = instantAuthStorage.isInstantAccess()
      if (!isInstant) {
        await api.post('/auth/logout', {})
      }
    } catch (err) {
      console.warn('Gagal memanggil endpoint logout di backend:', err)
    } finally {
      instantAuthStorage.clearSession()
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
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

