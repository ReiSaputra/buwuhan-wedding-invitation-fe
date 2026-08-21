import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type BackButtonProps = {
  /** Rute fallback jika user membuka halaman secara langsung tanpa histori browser */
  fallbackTo?: string
  /** Label teks tombol kembali */
  label?: string
  /** Class styling tambahan */
  className?: string
}

/**
 * Komponen tombol kembali ke halaman sebelumnya.
 * Cerdas menentukan navigasi balik browser `navigate(-1)` atau kembali ke `fallbackTo`
 * jika halaman diakses langsung melalui link baru.
 * 
 * @param props - Properti tombol kembali (fallbackTo, label, className)
 */
export function BackButton({ fallbackTo = '/dashboard', label = 'Kembali', className }: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Menangani aksi klik tombol kembali.
   */
  function handleBack() {
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
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150',
        'hover:bg-slate-50 hover:text-ink hover:border-slate-300 active:scale-95 cursor-pointer',
        className,
      )}
    >
      <ArrowLeft size={16} className="text-muted" />
      <span>{label}</span>
    </button>
  )
}