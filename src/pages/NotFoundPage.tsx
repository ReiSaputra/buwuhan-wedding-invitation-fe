import { Link, useLocation } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Halaman 404 untuk rute yang tidak dikenali.
 * Menggantikan perilaku lama yang selalu mengalihkan pengguna ke /dashboard,
 * sehingga tamu yang salah mengetik tautan undangan tidak lagi terlempar
 * ke halaman login.
 */
export default function NotFoundPage() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md space-y-5 text-center">
        <Compass size={40} className="mx-auto text-slate-300" />

        <div className="space-y-2">
          <p className="font-display text-4xl font-bold text-slate-300">404</p>
          <h1 className="font-display text-xl font-bold text-ink">
            Halaman tidak ditemukan
          </h1>
          <p className="text-xs leading-relaxed text-slate-500">
            Alamat <span className="font-mono text-slate-600">{location.pathname}</span> tidak
            tersedia. Periksa kembali tautan undangan yang Anda terima, atau
            hubungi pemilik undangan.
          </p>
        </div>

        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <Home size={14} />
          {isAuthenticated ? 'Kembali ke Dashboard' : 'Masuk ke Akun'}
        </Link>
      </div>
    </div>
  )
}