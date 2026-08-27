import { Outlet } from 'react-router-dom'

/**
 * Layout Khusus Halaman Autentikasi (Sign In & Sign Up).
 * Menyediakan latar belakang estetik dengan aksen ambient luxury wedding
 * dan wadah terpusat yang responsif di semua ukuran layar.
 */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      {/* Ornamen Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      {/* Konten Halaman Terpusat */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg">


        {/* Kartu Autentikasi */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-10 shadow-xl backdrop-blur-md">
          <Outlet />
        </div>

        {/* Footer Hak Cipta Singkat */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Buwuhan Digital Wedding. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  )
}
