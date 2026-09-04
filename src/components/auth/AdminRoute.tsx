import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

/**
 * Komponen pelindung rute khusus Administrator (AdminRoute).
 * Memeriksa bahwa pengguna telah login DAN memiliki role "ADMIN":
 * - Jika pengecekan sesi masih berlangsung, tampilkan indikator pemuatan.
 * - Jika belum login sama sekali, arahkan ke halaman `/login`.
 * - Jika sudah login tetapi role bukan ADMIN, tampilkan pesan larangan akses (403 Forbidden).
 * - Jika memenuhi syarat, tampilkan konten anak (`<Outlet />`).
 */
export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()
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
            <h3 className="font-display text-lg font-bold text-ink">Admin Buwuhan</h3>
            <p className="mt-1 text-xs text-muted">Memeriksa hak akses administrator Anda...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-danger border border-red-100">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block rounded-full bg-red-100/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-danger">
              403 Forbidden
            </span>
            <h2 className="font-display text-xl font-bold text-ink">
              Akses Ditolak
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Halaman ini dikhususkan untuk <strong>Superadmin</strong> platform Buwuhan. Akun Anda (<em>{user?.email}</em>) saat ini terdaftar sebagai peran <strong>{user?.role || 'USER'}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="primary" className="w-full" icon={<ArrowLeft size={14} />}>
                Kembali ke Dashboard Saya
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
