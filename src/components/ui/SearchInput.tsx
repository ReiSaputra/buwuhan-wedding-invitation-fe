import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SearchInputProps = {
  /** Nilai kata kunci saat ini */
  value: string
  /** Callback saat kata kunci berubah */
  onChange: (value: string) => void
  /** Teks bantuan di dalam kotak input */
  placeholder?: string
  /** Class styling tambahan */
  className?: string
}

/**
 * Kotak pencarian dengan ikon kaca pembesar dan tombol hapus cepat.
 *
 * @param props - Properti SearchInput (value, onChange, placeholder, className)
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-ink placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer"
          aria-label="Hapus pencarian"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
