import { useMemo, useState } from 'react'

export type UseTableStateOptions<T> = {
  /** Seluruh baris data yang tersedia */
  rows: T[]
  /** Jumlah baris per halaman */
  pageSize?: number
  /** Mengembalikan teks yang ikut dicari saat pengguna mengetik di kotak pencarian */
  getSearchText: (row: T) => string
  /** Filter tambahan opsional, misal berdasarkan status */
  filterFn?: (row: T) => boolean
}

/**
 * Hook pengelola state tabel: pencarian, filter, dan penomoran halaman.
 * Dipakai bersama oleh halaman RSVP, Buku Tamu, dan tabel lain agar
 * logika paginasi tidak ditulis ulang di setiap halaman.
 *
 * @param options - Konfigurasi baris, ukuran halaman, dan fungsi pencarian
 * @returns State tabel siap pakai beserta baris untuk halaman aktif
 *
 * @example
 * const table = useTableState({ rows: guests, getSearchText: (g) => g.name })
 */
export function useTableState<T>({
  rows,
  pageSize = 8,
  getSearchText,
  filterFn,
}: UseTableStateOptions<T>) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (filterFn && !filterFn(row)) return false
      if (!keyword) return true
      return getSearchText(row).toLowerCase().includes(keyword)
    })
  }, [rows, query, getSearchText, filterFn])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))

  // Menjaga halaman tetap valid ketika hasil filter menyusut
  const currentPage = Math.min(page, totalPages)

  const pageRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize],
  )

  const total = filteredRows.length
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  /** Mengubah kata kunci pencarian dan otomatis kembali ke halaman pertama. */
  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  /** Mengatur ulang paginasi ke halaman pertama, dipakai saat filter berubah. */
  function resetPage() {
    setPage(1)
  }

  return {
    /** Seluruh baris hasil pencarian dan filter, tanpa dipotong per halaman.
     *  Dipakai saat mengekspor data agar yang terunduh bukan cuma halaman aktif. */
    filteredRows,
    query,
    setQuery: handleQueryChange,
    page: currentPage,
    setPage,
    resetPage,
    totalPages,
    pageRows,
    total,
    from,
    to,
  }
}
