import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SearchInputProps = {
  /** Nilai kata kunci pencarian saat ini */
  value: string
  /** Callback yang dipanggil saat nilai kata kunci berubah */
  onChange: (value: string) => void
  /** Teks placeholder di dalam kotak input pencarian */
  placeholder?: string
  /** Class styling tambahan opsional */
  className?: string
}

/**
 * Komponen Kotak Pencarian Data Tabel (SearchInput).
 * Dilengkapi dengan ikon kaca pembesar di sisi kiri dan tombol bersihkan (clear 'X')
 * cepat di sisi kanan yang hanya muncul jika terdapat teks.
 * 
 * @param props - Properti SearchInput (value, onChange, placeholder, className)
 * 
 * @example
 * <SearchInput value={query} onChange={setQuery} placeholder="Cari nama tamu..." />
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari data...',
  className,
}: SearchInputProps) {
  /**
   * Menghapus seluruh teks kata kunci pencarian.
   */
  function handleClear() {
    onChange('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink cursor-pointer"
          aria-label="Hapus teks pencarian"
          title="Bersihkan"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}

