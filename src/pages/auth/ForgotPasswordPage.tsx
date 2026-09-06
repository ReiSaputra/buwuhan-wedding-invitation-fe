import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useForgotPassword } from '@/hooks/useAuthActions'

/**
 * Halaman Lupa Kata Sandi (Forgot Password).
 * Memungkinkan pengguna meminta tautan pemulihan kata sandi ke alamat email terdaftar.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { mutateAsync: requestReset, isPending } = useForgotPassword()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid')
      return
    }

    try {
      await requestReset({ email: email.trim() })
      setIsSubmitted(true)
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Gagal mengirim instruksi pemulihan. Pastikan email terdaftar.')
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header Form */}
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Lupa Kata Sandi?
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          Jangan khawatir! Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center shadow-xs animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Email Pemulihan Terkirim</h3>
            <p className="mt-1.5 text-xs text-emerald-700 leading-relaxed">
              Kami telah mengirimkan instruksi dan tautan reset kata sandi ke <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  placeholder="nama@domain.com"
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm text-ink placeholder:text-slate-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Mengirim Tautan...
                </span>
              ) : (
                'Kirim Tautan Reset'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
