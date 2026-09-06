import { useState, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import { useResetPassword } from '@/hooks/useAuthActions'

/**
 * Halaman Atur Ulang Kata Sandi (Reset Password).
 * Menggunakan token verifikasi dari URL untuk membuat kata sandi baru.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { mutateAsync: resetPassword, isPending } = useResetPassword()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!token) {
      setErrorMsg('Token reset kata sandi tidak valid atau telah kedaluwarsa.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok')
      return
    }

    try {
      await resetPassword({ token, newPassword })
      setIsSuccess(true)
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Gagal mengatur ulang kata sandi. Token mungkin sudah tidak berlaku.')
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Atur Ulang Kata Sandi
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          Buat kata sandi baru yang aman untuk akun Buwuhan Anda.
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center shadow-xs animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Kata Sandi Berhasil Diperbarui!</h3>
            <p className="mt-1.5 text-xs text-emerald-700 leading-relaxed">
              Kata sandi baru Anda telah tersimpan. Silakan masuk menggunakan kata sandi terbaru.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
            >
              Masuk Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
          {!token && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>Token reset tidak ditemukan di URL. Pastikan Anda membuka tautan dari email.</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  placeholder="Minimal 8 karakter..."
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !token}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Menyimpan Kata Sandi...
                </span>
              ) : (
                'Simpan Kata Sandi Baru'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
            >
              Batal dan Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
