import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ModalProps = {
  /** Menentukan apakah modal sedang terbuka */
  isOpen: boolean
  /** Callback untuk menutup modal */
  onClose: () => void
  /** Ikon opsional untuk header modal */
  icon?: ReactNode
  /** Judul header modal */
  title?: string
  /** Deskripsi atau sub-judul modal */
  description?: string
  /** Konten tubuh modal */
  children: ReactNode
  /** Lebar maksimal modal */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Menyembunyikan tombol close (X) */
  hideCloseButton?: boolean
  /** Menampilkan garis aksen gradien di bagian atas modal */
  showAccentBar?: boolean
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

/**
 * Komponen modal dialog overlay modern & responsif dengan latar blur,
 * animasi spring transisi, penutupan saat tombol ESC ditekan, dan scroll lock pada body.
 * 
 * @param props - Properti konfigurasi modal dialog
 */
export function Modal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  children,
  maxWidth = 'md',
  hideCloseButton = false,
  showAccentBar = true,
}: ModalProps) {
  // Tutup modal jika tombol Escape ditekan
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
      {/* Backdrop overlay dengan efek blur & fade in */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-modal-backdrop transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full flex flex-col max-h-[92vh] overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/5 animate-modal-card',
          maxWidthMap[maxWidth],
        )}
      >
        {/* Subtle Top Gradient Accent Bar */}
        {showAccentBar && (
          <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        )}

        {/* Ambient Top Glow Ornaments */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-purple-500/10 blur-2xl" />

        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between gap-3 px-5 sm:px-7 pt-5 sm:pt-6 pb-2">
          <div className="flex items-start gap-3.5 min-w-0">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-primary border border-indigo-100 shadow-xs">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50/80 text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-ink transition-all cursor-pointer active:scale-90"
              aria-label="Tutup modal"
              title="Tutup (ESC)"
            >
              <X size={16} className="transition-transform group-hover:rotate-90 duration-200" />
            </button>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-7 pb-6 sm:pb-7 pt-3 modal-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}


