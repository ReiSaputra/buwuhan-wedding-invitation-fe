import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

type Props = {
  /** Tujuan kalau user membuka halaman ini langsung dari URL (tidak ada histori) */
  fallbackTo?: string
  label?: string
}

export function BackButton({ fallbackTo = '/dashboard', label = 'Back' }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleBack() {
    // location.key === 'default' berarti ini entri histori pertama,
    // jadi navigate(-1) akan keluar dari aplikasi. Pakai fallback.
    if (location.key === 'default') {
      navigate(fallbackTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white hover:text-ink active:scale-95"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  )
}