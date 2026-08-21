import { List, LayoutGrid } from 'lucide-react'
import type { ViewMode } from '@/types/dashboard'
import { cn } from '@/lib/cn'

type Props = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: Props) {
  const base = 'rounded-lg p-2 transition'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Tampilan daftar"
        onClick={() => onChange('list')}
        className={cn(base, value === 'list' ? 'bg-primary text-white' : 'bg-white text-muted hover:text-ink')}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        aria-label="Tampilan grid"
        onClick={() => onChange('grid')}
        className={cn(base, value === 'grid' ? 'bg-primary text-white' : 'bg-white text-muted hover:text-ink')}
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  )
}