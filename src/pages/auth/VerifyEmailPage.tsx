import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuthActions'

/**
 * Halaman Verifikasi Email Pengguna Baru (Email Verification).
 * Memeriksa token dari tautan email dan memanggil endpoint verifikasi di backend.
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [resendEmail, setResendEmail] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isAutoVerifying, setIsAutoVerifying] =
  useState(Boolean(token))
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { mutateAsync: verifyEmail } = useVerifyEmail()
  const { mutateAsync: resendVerification, isPending: isResending } = useResendVerification()

  useEffect(() => {
    if (!token) return

    let isMounted = true

    async function executeVerification() {
      try {
        await verifyEmail({ token })
        if (isMounted) {
          setVerifyStatus('success')
        }
      } catch (err: unknown) {
        if (isMounted) {
          setVerifyStatus('error')
          setErrorMessage((err as Error)?.message || 'Token verifikasi tidak valid atau sudah kedaluwarsa.')
        }
      } finally {
        if (isMounted) {
          setIsAutoVerifying(false)
        }
      }
    }

    void executeVerification()

    return () => {
      isMounted = false
    }
  }, [token, verifyEmail])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!resendEmail.trim()) return

    try {
      await resendVerification({ email: resendEmail.trim() })
      setResendSuccess(true)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal mengirim ulang email verifikasi.')
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Verifikasi Email Akun
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          Konfirmasi kepemilikan email untuk mengaktifkan seluruh fitur undangan Buwuhan.
        </p>
      </div>

      {isAutoVerifying ? (
        <div className="rounded-2xl border border-violet-200 bg-white p-8 text-center shadow-sm space-y-4">
          <Loader2 size={36} className="mx-auto animate-spin text-violet-600" />
          <h3 className="text-base font-bold text-ink">Sedang Memverifikasi Email...</h3>
          <p className="text-xs text-muted">Mohon tunggu sebentar selagi kami mencocokkan data token Anda.</p>
        </div>
      ) : verifyStatus === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center shadow-xs animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Email Berhasil Diverifikasi!</h3>
            <p className="mt-1.5 text-xs text-emerald-700 leading-relaxed">
              Selamat! Akun Anda kini aktif sepenuhnya. Anda dapat mulai membuat undangan dan menikmati semua fitur premium Buwuhan.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <span>Buka Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-5">
          {token && verifyStatus === 'error' && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!token && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
              <span>
                Tautan verifikasi tidak memuat token. Jika Anda belum menerima email verifikasi, Anda dapat meminta pengiriman ulang di bawah ini.
              </span>
            </div>
          )}

          {/* Form Kirim Ulang Email Verifikasi */}
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label htmlFor="resendEmail" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kirim Ulang ke Alamat Email:
              </label>
              <div className="relative">
                <input
                  id="resendEmail"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            {resendSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>Email verifikasi baru berhasil dikirim! Silakan periksa kotak masuk Anda.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isResending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Mengirim...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw size={15} /> Kirim Ulang Email Verifikasi
                </span>
              )}
            </button>
          </form>

          <div className="mt-4 text-center border-t border-slate-100 pt-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
