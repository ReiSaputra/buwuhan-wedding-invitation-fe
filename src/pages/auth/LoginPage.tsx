import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError, type ParsedApiError } from '@/lib/errorHandler'


/**
 * Halaman Masuk Akun (Sign In).
 * Didesain presisi sesuai mockup dengan estetika luxury wedding modern:
 * - Form input Email dan Password dengan tombol toggle lihat/sembunyikan sandi.
 * - Tombol utama 'Masuk' ungu dengan animasi loading.
 * - Tautan 'Lupa password?' dan 'Buat di sini'.
 * - Tombol sosial 'Lanjut dengan Google' dan 'Lanjut dengan Facebook'.
 * - Penanganan error ramah pengguna (termasuk deteksi HTTP 429 rate limit 10x/15menit).
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State galat terstruktur dari parser API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Redirect ke rute yang sebelumnya ingin diakses, atau default ke /dashboard
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard'
  
  // Mengambil pesan sukses dari navigasi halaman sebelumnya (misal dari halaman register)
  const successMessage = (location.state as { successMessage?: string })?.successMessage

  /**
   * Menghapus error pada field tertentu saat pengguna mengetik ulang.
   */
  function handleFieldChange(field: string, value: string, setter: (v: string) => void) {
    setter(value)
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  /**
   * Menangani submit form login ke backend.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)
    setIsRateLimited(false)

    // Validasi dasar klien
    const clientErrors: Record<string, string[]> = {}
    if (!email.trim()) {
      clientErrors.email = ['Email wajib diisi']
    }
    if (!password) {
      clientErrors.password = ['Password wajib diisi']
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setIsLoading(true)

    try {
      const loggedUser = await login({ email, password })
      const requestedPath = (location.state as { from?: { pathname?: string } })?.from?.pathname
      if (loggedUser.role === 'ADMIN') {
        const isToAdminRoute = requestedPath && requestedPath.startsWith('/admin')
        navigate(isToAdminRoute ? requestedPath : '/admin/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const parsed: ParsedApiError = parseApiError(err)
      setIsRateLimited(parsed.isRateLimited)

      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors(parsed.fieldErrors)
      }

      if (parsed.generalMessage) {
        setGeneralError(parsed.generalMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Sign In
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Masuk untuk mengelola undangan pernikahanmu.
        </p>
      </div>

      {/* Alert Success */}
      {successMessage && !generalError && !isRateLimited && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 shadow-2xs animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}


      {/* Alert Error Umum / Rate Limit */}
      {(generalError || isRateLimited) && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium ${
            isRateLimited
              ? 'border border-amber-200 bg-amber-50 text-amber-800'
              : 'border border-danger/20 bg-danger-light text-danger'
          }`}
        >
          {isRateLimited ? (
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          )}
          <span className="leading-relaxed">
            {generalError || 'Terjadi kendala saat proses masuk akun.'}
          </span>
        </div>
      )}

      {/* Formulir Sign In */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kolom Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
            placeholder="Masukkan email anda..."
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:outline-none focus:ring-3 shadow-2xs ${
              fieldErrors.email?.length
                ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                : 'border-violet-200/90 focus:border-violet-600 focus:ring-violet-500/15'
            }`}
          />

          {/* Container Pesan Error di Bawah Input Email */}
          {fieldErrors.email && fieldErrors.email.length > 0 && (
            <div className="mt-1.5 flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2 text-xs font-medium text-red-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.email.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0 text-red-500" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
              placeholder="Masukkan password anda..."
              className={`w-full rounded-2xl border bg-white px-4 py-3 pr-11 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:outline-none focus:ring-3 shadow-2xs ${
                fieldErrors.password?.length
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                  : 'border-violet-200/90 focus:border-violet-600 focus:ring-violet-500/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Container Pesan Error di Bawah Input Password */}
          {fieldErrors.password && fieldErrors.password.length > 0 && (
            <div className="mt-1.5 flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2 text-xs font-medium text-red-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.password.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0 text-red-500" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lupa Password */}
          <div className="pt-0.5">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-violet-600 hover:text-violet-700 transition cursor-pointer"
            >
              Lupa password?
            </Link>
          </div>
        </div>


        {/* Tombol Masuk */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 hover:shadow-violet-500/35 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>

        {/* Link Buat Akun */}
        <p className="pt-1 text-center text-xs text-slate-600">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-bold text-violet-600 hover:text-violet-700 hover:underline transition"
          >
            Buat di sini
          </Link>
        </p>
      </form>

      {/* Pembatas ATAU */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          ATAU
        </span>
      </div>

      {/* Tombol Sosial Login */}
      <div className="space-y-2.5">
        {/* Google */}
        <button
          type="button"
          onClick={() => alert('Fitur masuk dengan Google akan segera hadir.')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-violet-100/70 hover:border-violet-200 cursor-pointer shadow-2xs"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Lanjut dengan Google</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => alert('Fitur masuk dengan Facebook akan segera hadir.')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-violet-100/70 hover:border-violet-200 cursor-pointer shadow-2xs"
        >
          <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Lanjut dengan Facebook</span>
        </button>
      </div>
    </div>
  )
}
