import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { BackendSuccessEnvelope } from '@/types/auth'

/**
 * Variabel in-memory closure untuk menyimpan Access Token sementara.
 * Token ini TIDAK disimpan di localStorage / sessionStorage demi mencegah celah eksfiltrasi XSS.
 */
let inMemoryAccessToken: string | null = null

/**
 * Callback opsional saat sesi autentikasi kedaluwarsa total (refresh token gagal).
 */
let onAuthFailedCallback: (() => void) | null = null

/**
 * Mengatur atau menghapus Access Token di memori aplikasi.
 * 
 * @param token - String JWT access token baru atau null saat logout/expired
 */
export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token
}

/**
 * Mengambil Access Token yang sedang aktif tersimpan di memori.
 * 
 * @returns String JWT access token atau null
 */
export function getAccessToken(): string | null {
  return inMemoryAccessToken
}

/**
 * Mendaftarkan fungsi callback yang dipanggil ketika sesi autentikasi gagal dipulihkan.
 * 
 * @param callback - Fungsi yang dijalankan saat user harus diarahkan ke login
 */
export function setOnAuthFailed(callback: () => void): void {
  onAuthFailedCallback = callback
}

/**
 * Instance Axios terkonfigurasi:
 * - baseURL dari environment VITE_API_BASE_URL (default: http://localhost:3000/v1)
 * - withCredentials: true (wajib agar cookie httpOnly refreshToken otomatis terkirim dan diterima)
 * - timeout 15 detik
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/v1/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})


/**
 * Interceptor request:
 * Otomatis menyisipkan header Authorization: Bearer <accessToken> dari memori
 * untuk setiap request yang dikirimkan.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Variabel status dan antrean untuk menangani refresh token tunggal saat ada request bersamaan
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

/**
 * Memproses antrean request yang tertahan saat proses refresh token sedang berjalan.
 * 
 * @param error - Objek error jika refresh token gagal
 * @param token - Token baru jika refresh token berhasil
 */
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Interceptor response:
 * Mendeteksi error 401 Unauthorized (token kedaluwarsa) dan melakukan silent refresh
 * otomatis ke endpoint POST /auth/refresh-token tanpa mengganggu alur pengguna.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Jika tidak ada config atau error bukan 401, teruskan error
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // Jangan lakukan refresh otomatis untuk endpoint auth dasar agar tidak terjadi looping tak terbatas
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/logout')

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Jika sedang dalam proses refresh token oleh request lain, tahan request ini ke antrean
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Panggil POST /auth/refresh-token (cookie otomatis terkirim karena withCredentials: true)
      const res = await api.post<BackendSuccessEnvelope<{ accessToken: string }>>(
        '/auth/refresh-token',
        {},
      )

      const newAccessToken = res.data?.data?.accessToken

      if (!newAccessToken) {
        throw new Error('Access token baru tidak ditemukan dalam respon refresh-token')
      }

      setAccessToken(newAccessToken)
      processQueue(null, newAccessToken)

      // Ulangi request awal dengan access token yang baru
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      // Refresh token gagal / expired total
      setAccessToken(null)
      processQueue(refreshError, null)

      if (onAuthFailedCallback) {
        onAuthFailedCallback()
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

/**
 * Melakukan HTTP GET request dan mengekstrak payload data dari envelope backend.
 * 
 * @template T - Tipe data payload yang diharapkan
 * @param url - Endpoint URL target API
 * @returns Promise berisi data hasil respons
 */
export async function fetchData<T>(url: string): Promise<T> {
  const res = await api.get<BackendSuccessEnvelope<T>>(url)
  return res.data.data
}

/**
 * Melakukan HTTP POST request dengan payload data dan mengekstrak payload respon.
 * 
 * @template T - Tipe data payload respons yang diharapkan
 * @template B - Tipe data request body
 * @param url - Endpoint URL target API
 * @param body - Data yang dikirimkan ke server
 * @returns Promise berisi data hasil respons
 */
export async function postData<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const res = await api.post<BackendSuccessEnvelope<T>>(url, body)
  return res.data.data
}
