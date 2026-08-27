import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Komponen pelindung rute privat (ProtectedRoute).
 * Memeriksa status autentikasi pengguna:
 * - Jika pengecekan sesi (silent refresh) masih berjalan, tampilkan layar pemuatan elegan.
 * - Jika pengguna belum login, alihkan ke halaman `/login` dengan menyimpan lokasi tujuan.
 * - Jika sudah terotentikasi, tampilkan konten anak (`<Outlet />`).
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles size={28} className="animate-pulse text-primary" />
            <Loader2 size={36} className="absolute animate-spin text-primary/40" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Buwuhan Invitation</h3>
            <p className="mt-1 text-xs text-muted">Memeriksa sesi keamanan akun Anda...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
