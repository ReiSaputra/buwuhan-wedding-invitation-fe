import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type PaginationProps = {
  /** Halaman aktif saat ini (dimulai dari 1) */
  page: number
  /** Jumlah total halaman */
  totalPages: number
  /** Callback saat pengguna memilih halaman lain */
  onPageChange: (page: number) => void
}

/**
 * Menyusun daftar nomor halaman yang tampil, lengkap dengan titik-titik
 * pemisah bila jumlah halaman terlalu banyak untuk ditampilkan semuanya.
 *
 * @param page - Halaman aktif
 * @param totalPages - Jumlah total halaman
 * @returns Array nomor halaman, dengan 'gap' sebagai penanda titik-titik
 */
function buildPageItems(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  // Jendela tiga nomor yang selalu memuat halaman aktif di tengah
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
 * Navigasi penomoran halaman tabel.
 * Tombol panah otomatis mati di halaman pertama dan terakhir.
 *
 * @param props - Properti Pagination (page, totalPages, onPageChange)
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = buildPageItems(page, totalPages)
  const arrowClass =
    'flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-ink disabled:opacity-40 disabled:pointer-events-none cursor-pointer'

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
          <span key={`gap-${index}`} className="px-1 text-xs text-slate-400">
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'flex h-7 min-w-7 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition cursor-pointer',
              item === page
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-ink',
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
