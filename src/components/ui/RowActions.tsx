import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/cn'

export type RowAction = {
  /** Label menu aksi */
  label: string
  /** Ikon di samping label */
  icon?: ReactNode
  /** Fungsi yang dijalankan saat menu dipilih */
  onClick: () => void
  /** Menandai aksi berisiko (dirender merah), misal Hapus */
  isDanger?: boolean
}

export type RowActionsProps = {
  /** Daftar menu aksi untuk baris tabel ini */
  actions: RowAction[]
}

/**
 * Tombol tiga titik pada kolom Aksi tabel, membuka menu dropdown.
 * Menu tertutup otomatis saat pengguna mengklik di luar area atau menekan Escape.
 *
 * @param props - Properti RowActions (actions)
 */
export function RowActions({ actions }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)
        }
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer"
        aria-label="Buka menu aksi"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="glass-dropdown absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl py-1 animate-in fade-in zoom-in-95 duration-150">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setIsOpen(false)
                action.onClick()
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition cursor-pointer',
                action.isDanger
                  ? 'text-danger hover:bg-danger-light'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
              )}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
