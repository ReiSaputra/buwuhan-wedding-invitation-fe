import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError, type ParsedApiError } from '@/lib/errorHandler'
import { redirectToFacebookOAuth } from '@/lib/facebook'

/**
 * Halaman Masuk Akun (Sign In).
 * Didesain presisi dengan estetika luxury modern:
 * - Input Email & Password dengan visual feedback interaktif.
 * - Tombol utama Masuk dengan micro-interaction dan gradient luxury.
 * - Tombol sosial Google & Facebook yang konsisten, serasi, dan elegan.
 */
export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFbLoading, setIsFbLoading] = useState(false)

  // State galat terstruktur dari parser API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Redirect ke rute yang sebelumnya ingin diakses, atau default ke /dashboard
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard'
  
  // Mengambil pesan sukses dari navigasi halaman sebelumnya
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

  /**
   * Custom hook Google Sign-In OAuth popup flow
   */
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setFieldErrors({})
      setGeneralError(null)
      setIsRateLimited(false)
      setIsGoogleLoading(true)

      try {
        const loggedUser = await loginWithGoogle({ code: codeResponse.code })
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
        setGeneralError(parsed.generalMessage || 'Gagal masuk menggunakan akun Google.')
      } finally {
        setIsGoogleLoading(false)
      }
    },
    onError: () => {
      setGeneralError('Autentikasi Google gagal atau ditutup. Silakan coba kembali.')
    },
  })

  /**
   * Menangani autentikasi masuk via Facebook OAuth.
   */
  function handleFacebookLogin() {
    setFieldErrors({})
    setGeneralError(null)
    setIsRateLimited(false)
    setIsFbLoading(true)

    try {
      redirectToFacebookOAuth()
    } catch (err: unknown) {
      setIsFbLoading(false)
      const parsed: ParsedApiError = parseApiError(err)
      setIsRateLimited(parsed.isRateLimited)
      setGeneralError(parsed.generalMessage || (err instanceof Error ? err.message : 'Gagal membuka Facebook Login.'))
    }
  }

  const isAnyLoading = isLoading || isGoogleLoading || isFbLoading

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="text-center space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Masuk untuk mengelola undangan digitalmu.
        </p>
      </div>

      {/* Alert Success */}
      {successMessage && !generalError && !isRateLimited && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-medium text-emerald-800 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Alert Error Umum / Rate Limit */}
      {(generalError || isRateLimited) && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
            isRateLimited
              ? 'border border-amber-200 bg-amber-50 text-amber-800'
              : 'border border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {isRateLimited ? (
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
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
            placeholder="nama@email.com"
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-3 shadow-2xs ${
              fieldErrors.email?.length
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400/15'
                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/15'
            }`}
          />

          {/* Container Pesan Error di Bawah Input Email */}
          {fieldErrors.email && fieldErrors.email.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-2 text-xs font-medium text-rose-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.email.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0 text-rose-500" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-medium text-violet-600 hover:text-violet-700 transition"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
              placeholder="••••••••"
              className={`w-full rounded-2xl border bg-white px-4 py-3 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-3 shadow-2xs ${
                fieldErrors.password?.length
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400/15'
                  : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/15'
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
            <div className="mt-1 flex flex-col gap-1 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-2 text-xs font-medium text-rose-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.password.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0 text-rose-500" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Masuk */}
        <button
          type="submit"
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
        <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          ATAU
        </span>
      </div>

      {/* Tombol Sosial Login */}
      <div className="flex flex-col gap-3">
        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50/90 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 size={16} className="animate-spin text-slate-600" />
              <span>Menghubungkan ke Google...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Login dengan Google</span>
            </>
          )}
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50/90 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isFbLoading ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#1877F2]" />
              <span>Menghubungkan ke Facebook...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Lanjut dengan Facebook</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
