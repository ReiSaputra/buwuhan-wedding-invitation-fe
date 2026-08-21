import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ModalProps = {
  /** Menentukan apakah modal sedang terbuka */
  isOpen: boolean
  /** Callback untuk menutup modal */
  onClose: () => void
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
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

/**
 * Komponen modal dialog overlay dengan latar blur, animasi transisi,
 * penutupan saat tombol ESC ditekan, dan scroll lock pada body.
 * 
 * @param props - Properti konfigurasi modal dialog
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  hideCloseButton = false,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transition-all',
          maxWidthMap[maxWidth],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-display text-xl font-bold text-ink">{title}</h3>}
            {description && <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>}
          </div>

          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-ink transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
