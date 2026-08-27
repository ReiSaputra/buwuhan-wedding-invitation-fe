import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError, type ParsedApiError } from '@/lib/errorHandler'

/**
 * Halaman Pendaftaran Akun Baru (Sign Up).
 * Didesain presisi sesuai mockup dengan estetika luxury wedding modern:
 * - Ruas input Nama lengkap, Email, dan Password dengan tombol toggle lihat sandi.
 * - Container pesan error interaktif tepat di bawah masing-masing input sesuai format respon validasi backend (Zod/Valibot).
 * - Tombol utama 'Daftar' ungu dengan status loading.
 * - Tautan kembali 'Sudah punya akun? Masuk di sini'.
 * - Penanganan error ramah pengguna (termasuk deteksi HTTP 429 rate limit 5x/jam).
 */
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State galat terstruktur dari parser API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  /**
   * Menghapus error pada field tertentu saat pengguna mulai mengetik ulang.
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
   * Menangani submit form pendaftaran ke backend.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)
    setIsRateLimited(false)

    // Validasi dasar di sisi klien
    const clientErrors: Record<string, string[]> = {}
    if (!fullName.trim()) {
      clientErrors.fullName = ['Nama lengkap wajib diisi']
    }
    if (!email.trim()) {
      clientErrors.email = ['Email wajib diisi']
    }
    if (!password) {
      clientErrors.password = ['Password wajib diisi']
    } else if (password.length < 8) {
      clientErrors.password = ['Password minimal 8 karakter']
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setIsLoading(true)

    try {
      await register({ fullName, email, password })
      // Berhasil daftar -> arahkan ke halaman login dengan pesan sukses
      navigate('/login', { 
        replace: true, 
        state: { successMessage: 'Akun berhasil dibuat. Silakan masuk dengan email dan password Anda.' } 
      })
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
          Sign Up
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Buat akun untuk mulai mengelola undanganmu.
        </p>
      </div>

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
            {generalError || 'Terjadi kesalahan pada saat pendaftaran.'}
          </span>
        </div>
      )}

      {/* Formulir Sign Up */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kolom Nama Lengkap */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
            Nama lengkap
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)}
            placeholder="Masukkan nama lengkap anda..."
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:outline-none focus:ring-3 shadow-2xs ${
              fieldErrors.fullName?.length
                ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                : 'border-violet-200/90 focus:border-violet-600 focus:ring-violet-500/15'
            }`}
          />

          {/* Container Pesan Error di Bawah Input Nama Lengkap */}
          {fieldErrors.fullName && fieldErrors.fullName.length > 0 && (
            <div className="mt-1.5 flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2 text-xs font-medium text-red-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.fullName.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0 text-red-500" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
              autoComplete="new-password"
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
            <div className="mt-1.5 flex flex-col gap-1.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-600 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-1.5 font-bold text-red-700">
                <AlertCircle size={14} className="shrink-0 text-red-500" />
                <span>Persyaratan kata sandi belum terpenuhi:</span>
              </div>
              <ul className="pl-5 space-y-1 list-disc text-[11px] text-red-600">
                {fieldErrors.password.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tombol Daftar */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 hover:shadow-violet-500/35 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Mendaftarkan...</span>
            </>
          ) : (
            <span>Daftar</span>
          )}
        </button>

        {/* Link Masuk */}
        <p className="pt-2 text-center text-xs text-slate-600">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-bold text-violet-600 hover:text-violet-700 hover:underline transition"
          >
            Masuk di sini
          </Link>
        </p>
      </form>
    </div>
  )
}

