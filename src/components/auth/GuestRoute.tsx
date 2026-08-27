import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Komponen pelindung rute publik/tamu (GuestRoute).
 * Memastikan pengguna yang sudah berhasil login tidak dapat mengakses
 * kembali halaman `/login` atau `/register` dan otomatis dialihkan ke `/dashboard`.
 */
export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
