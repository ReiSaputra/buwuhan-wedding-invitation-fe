import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError } from '@/lib/errorHandler'

/**
 * Halaman Callback OAuth Facebook.
 * Menangani pengalihan dari Facebook jika proses login menggunakan alur redirect:
 * 1. Mengekstrak parameter `code` atau hash `#access_token` dari URL.
 * 2. Mengirimkan kredensial ke backend POST /auth/facebook.
 * 3. Mengarahkan pengguna yang sukses ke /dashboard.
 */
export default function FacebookCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithFacebook } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const isProcessedRef = useRef(false)

  useEffect(() => {
    if (isProcessedRef.current) return

    // 1. Ekstrak code dari search params (?code=...)
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      isProcessedRef.current = true
      setError(errorDescription || 'Autentikasi Facebook dibatalkan atau ditolak.')
      return
    }

    // 2. Ekstrak access_token jika ada di URL hash fragment (#access_token=...)
    let accessTokenFromHash: string | undefined
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      accessTokenFromHash = hashParams.get('access_token') || undefined
    }

    if (!code && !accessTokenFromHash) {
      isProcessedRef.current = true
      setError('Parameter autentikasi Facebook tidak ditemukan.')
      return
    }

    isProcessedRef.current = true

    async function handleCallback() {
      try {
        const loggedUser = await loginWithFacebook({
          code: code || undefined,
          accessToken: accessTokenFromHash,
        })

        if (loggedUser.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (err: unknown) {
        const parsed = parseApiError(err)
        setError(parsed.generalMessage || 'Gagal memproses autentikasi Facebook.')
      }
    }

    void handleCallback()
  }, [searchParams, loginWithFacebook, navigate])

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center space-y-4">
      {error ? (
        <div className="space-y-4 max-w-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-600 mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Autentikasi Gagal</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full rounded-2xl bg-violet-600 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-violet-700 transition cursor-pointer"
          >
            Kembali ke Halaman Masuk
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-200">
          <Loader2 size={32} className="animate-spin text-violet-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">Menghubungkan akun Facebook...</p>
            <p className="text-xs text-slate-400">Mohon tunggu sebentar, Anda akan segera dialihkan.</p>
          </div>
        </div>
      )}
    </div>
  )
}
