import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type PaginationProps = {
  /** Nomor halaman aktif saat ini (1-indexed) */
  page: number
  /** Jumlah total keseluruhan halaman */
  totalPages: number
  /** Callback yang dipanggil saat pengguna berpindah ke halaman lain */
  onPageChange: (page: number) => void
}

/**
 * Menyusun daftar item nomor halaman yang ditampilkan,
 * termasuk penanda titik-titik ('gap') jika jumlah halaman panjang.
 * 
 * @param page - Halaman aktif
 * @param totalPages - Total halaman
 * @returns Array berisi nomor halaman atau string 'gap'
 */
function buildPageItems(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  // Jendela nomor halaman yang selalu menyertakan halaman aktif
  const start = Math.max(1, Math.min(page - 1, totalPages - 2))
  const end = Math.min(totalPages, start + 2)

  const items: Array<number | 'gap'> = []
  for (let i = start; i <= end; i += 1) {
    items.push(i)
  }

  if (start > 1) {
    if (start > 2) items.unshift('gap')
    items.unshift(1)
  }

  if (end < totalPages) {
    if (end < totalPages - 1) items.push('gap')
    items.push(totalPages)
  }

  return items
}

/**
 * Komponen Navigasi Paginasi Halaman Tabel (Pagination).
 * Menampilkan tombol Sebelumnya, nomor-nomor halaman, dan tombol Berikutnya.
 * 
 * @param props - Properti Pagination (page, totalPages, onPageChange)
 * 
 * @example
 * <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = buildPageItems(page, totalPages)
  const arrowClass =
    'flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:text-ink disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs'

  return (
    <nav className="flex items-center gap-1.5" aria-label="Navigasi halaman">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={arrowClass}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={14} />
      </button>

      {items.map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-xs text-slate-400 select-none">
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'flex h-7 min-w-7 items-center justify-center rounded-xl border px-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs',
              item === page
                ? 'border-primary bg-primary text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={arrowClass}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  )
}

