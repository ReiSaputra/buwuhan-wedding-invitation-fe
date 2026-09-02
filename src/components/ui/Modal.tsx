import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
 * Komponen modal dialog overlay dengan performa tinggi (GPU-composited),
 * transisi pegas presisi tanpa lag/jank, penutupan via ESC/backdrop,
 * dan body scroll lock.
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay animasi terakselerasi GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transform-gpu"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Card dengan animasi Spring presisi & GPU compositing */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.93, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
              mass: 0.7,
            }}
            style={{ willChange: 'transform, opacity' }}
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transform-gpu',
              maxWidthMap[maxWidth],
            )}
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
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
            )}

            {/* Body Content */}
            <div className={title || !hideCloseButton ? 'mt-4' : ''}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
