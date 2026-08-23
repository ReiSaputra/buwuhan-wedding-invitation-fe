import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/cn'

export type RowAction = {
  /** Label menu aksi (misal: "Salin Nomor HP", "Hapus Catatan") */
  label: string
  /** Ikon pendukung di sisi kiri label */
  icon?: ReactNode
  /** Fungsi yang dipanggil saat menu diklik */
  onClick: () => void
  /** Menandai aksi berbahaya/destruktif (ditampilkan merah), misal Hapus */
  isDanger?: boolean
}

export type RowActionsProps = {
  /** Daftar menu aksi untuk baris data tabel ini */
  actions: RowAction[]
}

/**
 * Komponen Tombol Dropdown Menu Aksi Baris Tabel (RowActions).
 * Menampilkan ikon titik tiga vertikal yang membuka popover menu kontekstual.
 * Menutup otomatis saat pengguna mengklik di luar area atau menekan tombol Escape.
 * 
 * @param props - Properti RowActions (actions)
 * 
 * @example
 * <RowActions actions={[{ label: 'Ubah', icon: <Pencil size={14} />, onClick: handleEdit }]} />
 */
export function RowActions({ actions }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * Listener global untuk menutup menu dropdown saat klik di luar area atau tekan ESC.
   */
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

  /**
   * Mengubah status buka/tutup menu aksi dropdown.
   */
  function handleToggleOpen() {
    setIsOpen((prev) => !prev)
  }

  /**
   * Menjalankan aksi terpilih dan langsung menutup menu dropdown.
   * 
   * @param action - Objek aksi yang dipilih
   */
  function handleSelectAction(action: RowAction) {
    setIsOpen(false)
    action.onClick()
  }

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={handleToggleOpen}
        className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Buka menu aksi"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="glass-dropdown absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-2xl border border-slate-100/80 p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleSelectAction(action)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-medium transition cursor-pointer',
                action.isDanger
                  ? 'text-danger hover:bg-danger-light'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
              )}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

