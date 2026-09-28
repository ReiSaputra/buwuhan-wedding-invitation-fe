import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

/**
 * Layout Khusus Halaman Autentikasi (Sign In & Sign Up).
 * Menyediakan latar belakang polos bersih, minimalis, dan wadah terpusat
 * yang rapi dan responsif di semua ukuran layar.
 */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      {/* Konten Halaman Terpusat */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        {/* Tombol Navigasi Kembali ke Beranda */}
        <div className="mb-4 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Kartu Autentikasi Putih Bersih */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          {/* Logo Brand Resmi di Dalam Card */}
          <div className="mb-6 flex justify-center">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" showTagline={true} />
            </Link>
          </div>

          <Outlet />
        </div>

        {/* Footer Hak Cipta Singkat */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} buwuh.com. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  )
}



