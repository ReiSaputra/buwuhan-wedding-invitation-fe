import axios from "axios";
import type { ApiResponse } from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Ambil token admin dari localStorage kalau ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Helper: langsung ambil `data` dari envelope { success, data } */
export async function fetchData<T>(url: string): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url);
  return res.data.data;
}

export async function postData<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data.data;
}
