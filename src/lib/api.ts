import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { BackendSuccessEnvelope } from "@/types/auth";
import { instantAuthStorage } from "@/lib/instantAuthStorage";

/**
 * Variabel in-memory closure untuk menyimpan Access Token sementara.
 * Token ini TIDAK disimpan di localStorage / sessionStorage demi mencegah celah eksfiltrasi XSS.
 */
let inMemoryAccessToken: string | null = null;

/**
 * Callback opsional saat sesi autentikasi kedaluwarsa total (refresh token gagal).
 */
let onAuthFailedCallback: (() => void) | null = null;

/**
 * Callback opsional saat access token berhasil diperbarui di latar belakang.
 */
let onTokenRefreshedCallback: ((token: string) => void) | null = null;

/**
 * Mengatur atau menghapus Access Token di memori aplikasi.
 *
 * @param token - String JWT access token baru atau null saat logout/expired
 */
export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

/**
 * Mengambil Access Token yang sedang aktif tersimpan di memori.
 *
 * @returns String JWT access token atau null
 */
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/**
 * Mendaftarkan fungsi callback yang dipanggil ketika sesi autentikasi gagal dipulihkan.
 *
 * @param callback - Fungsi yang dijalankan saat user harus diarahkan ke login
 */
export function setOnAuthFailed(callback: (() => void) | null): void {
  onAuthFailedCallback = callback;
}

/**
 * Mendaftarkan fungsi callback yang dipanggil ketika access token baru berhasil diperoleh.
 *
 * @param callback - Fungsi yang menerima access token baru
 */
export function setOnTokenRefreshed(callback: ((token: string) => void) | null): void {
  onTokenRefreshedCallback = callback;
}

/**
 * Instance Axios terkonfigurasi:
 * - baseURL dari environment VITE_API_BASE_URL (default: http://localhost:3000/v1)
 * - withCredentials: true (wajib agar cookie httpOnly refreshToken otomatis terkirim dan diterima)
 * - timeout 15 detik
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/v1/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor request:
 * Otomatis menyisipkan header Authorization: Bearer <accessToken> dari memori
 * untuk setiap request yang dikirimkan.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isInstant = instantAuthStorage.isInstantAccess();
    const token = isInstant
      ? instantAuthStorage.getToken()
      : inMemoryAccessToken;

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isInstant) {
      const memberName = instantAuthStorage.getMemberName();
      if (memberName && !config.headers['X-Actor-Name']) {
        config.headers['X-Actor-Name'] = memberName;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Variabel penampung Promise in-flight untuk refresh token.
 * Mencegah race condition ketika multiple requests atau React StrictMode
 * memanggil refresh token pada waktu bersamaan.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Melakukan refresh access token secara terpusat dan aman dari race condition (Singleton Promise).
 * Semua pemanggil paralel (initSession, interceptor 401, query data) akan menunggu Promise yang sama.
 * Tepat 1 HTTP POST /auth/refresh-token yang dikirim ke backend.
 *
 * @returns Access token baru jika berhasil, atau melempar error / null jika gagal
 */
export async function requestRefreshToken(): Promise<string | null> {
  // Jika sedang ada request refresh token yang berjalan, gunakan Promise yang sama
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const isInstant = instantAuthStorage.isInstantAccess();
      if (isInstant) {
        const token = instantAuthStorage.getToken();
        return token;
      }

      const res = await api.post<
        BackendSuccessEnvelope<{ accessToken: string }>
      >("/auth/refresh-token", {});

      const newToken = res.data?.data?.accessToken;
      if (!newToken) {
        throw new Error(
          "Access token baru tidak ditemukan dalam respon refresh-token",
        );
      }

      setAccessToken(newToken);

      if (onTokenRefreshedCallback) {
        onTokenRefreshedCallback(newToken);
      }

      return newToken;
    } catch (error) {
      setAccessToken(null);
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Interceptor response:
 * Mendeteksi error 401 Unauthorized (token kedaluwarsa) dan melakukan silent refresh
 * otomatis menggunakan singleton requestRefreshToken() tanpa memicu race condition.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Jika tidak ada config atau error bukan 401, teruskan error
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isInstant = instantAuthStorage.isInstantAccess();

    // Jangan coba refresh token untuk sesi instan (karena tidak memakai cookie refresh-token)
    if (isInstant) {
      return Promise.reject(error);
    }

    // Jangan lakukan refresh otomatis untuk endpoint auth dasar agar tidak terjadi looping tak terbatas
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/logout");

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await requestRefreshToken();
      if (!newToken) {
        throw new Error("Gagal memperoleh access token baru");
      }

      // Ulangi request awal dengan access token yang baru
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (onAuthFailedCallback) {
        onAuthFailedCallback();
      }
      return Promise.reject(refreshError);
    }
  },
);

/**
 * Melakukan HTTP GET request dan mengekstrak payload data dari envelope backend.
 *
 * @template T - Tipe data payload yang diharapkan
 * @param url - Endpoint URL target API
 * @returns Promise berisi data hasil respons
 */
export async function fetchData<T>(url: string): Promise<T> {
  const res = await api.get<BackendSuccessEnvelope<T>>(url);
  return res.data.data;
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
  const res = await api.post<BackendSuccessEnvelope<T>>(url, body);
  return res.data.data;
}

/**
 * Melakukan HTTP PATCH request dan mengekstrak payload data dari envelope backend.
 */
export async function patchData<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const res = await api.patch<BackendSuccessEnvelope<T>>(url, body);
  return res.data.data;
}

/**
 * Melakukan HTTP DELETE request. Backend hanya mengirim { message, status }
 * tanpa field data, jadi fungsi ini tidak mengembalikan apa pun.
 */
export async function deleteData(url: string): Promise<void> {
  await api.delete(url);
}
