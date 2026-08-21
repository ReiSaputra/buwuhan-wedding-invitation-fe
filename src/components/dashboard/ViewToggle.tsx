import { List, LayoutGrid } from 'lucide-react'
import type { ViewMode } from '@/types/dashboard'
import { cn } from '@/lib/cn'

export type ViewToggleProps = {
  /** Mode tampilan yang sedang aktif ('list' atau 'grid') */
  value: ViewMode
  /** Callback saat user berpindah mode tampilan */
  onChange: (mode: ViewMode) => void
}

/**
 * Komponen tombol pengalih mode tampilan antara Daftar (List) dan Kisi (Grid).
 * 
 * @param props - Properti ViewToggle (value, onChange)
 */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
      <button
        type="button"
        title="Tampilan Daftar (List)"
        aria-label="Tampilan daftar"
        onClick={() => onChange('list')}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
          value === 'list'
            ? 'bg-white text-primary shadow-2xs font-bold'
            : 'text-slate-500 hover:text-ink',
        )}
      >
        <List size={15} />
        <span className="hidden sm:inline">Daftar</span>
      </button>

      <button
        type="button"
        title="Tampilan Kisi (Grid)"
        aria-label="Tampilan grid"
        onClick={() => onChange('grid')}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
          value === 'grid'
            ? 'bg-white text-primary shadow-2xs font-bold'
            : 'text-slate-500 hover:text-ink',
        )}
      >
        <LayoutGrid size={15} />
        <span className="hidden sm:inline">Grid</span>
      </button>
    </div>
  )
}