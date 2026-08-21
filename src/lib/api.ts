import axios from "axios";
import type { ApiResponse } from "@/types";

/**
 * Instance Axios terkonfigurasi dengan baseURL dari environment variable
 * dan timeout 15 detik.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Interceptor request untuk otomatis menyisipkan Authorization Bearer Token
 * dari localStorage jika user telah melakukan login.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Melakukan HTTP GET request dan mengekstrak data dari struktur envelope { success, data }.
 * 
 * @template T - Tipe data payload yang diharapkan
 * @param url - Endpoint URL target API
 * @returns Promise berisi data hasil respons
 */
export async function fetchData<T>(url: string): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url);
  return res.data.data;
}

/**
 * Melakukan HTTP POST request dengan payload data dan mengekstrak respons data.
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
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data.data;
}
