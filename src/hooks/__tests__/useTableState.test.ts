import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTableState } from '@/hooks/useTableState'

type Row = { id: string; name: string; status: 'HADIR' | 'TIDAK_HADIR' }

const rows: Row[] = [
  { id: '1', name: 'Budi Santoso', status: 'HADIR' },
  { id: '2', name: 'Siti Aminah', status: 'TIDAK_HADIR' },
  { id: '3', name: 'Andi Pratama', status: 'HADIR' },
  { id: '4', name: 'Citra Lestari', status: 'HADIR' },
]

const getSearchText = (row: Row) => row.name

describe('useTableState', () => {
  it('memotong baris sesuai ukuran halaman', () => {
    const { result } = renderHook(() =>
      useTableState({ rows, pageSize: 2, getSearchText }),
    )

    expect(result.current.pageRows).toHaveLength(2)
    expect(result.current.totalPages).toBe(2)
    expect(result.current.from).toBe(1)
    expect(result.current.to).toBe(2)
  })

  it('menyaring baris berdasarkan kata kunci pencarian', () => {
    const { result } = renderHook(() =>
      useTableState({ rows, pageSize: 10, getSearchText }),
    )

    act(() => result.current.setQuery('budi'))

    expect(result.current.total).toBe(1)
    expect(result.current.pageRows[0]?.name).toBe('Budi Santoso')
  })

  it('kembali ke halaman pertama saat kata kunci berubah', () => {
    const { result } = renderHook(() =>
      useTableState({ rows, pageSize: 2, getSearchText }),
    )

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)

    act(() => result.current.setQuery('a'))
    expect(result.current.page).toBe(1)
  })

  it('menerapkan filter tambahan bersamaan dengan pencarian', () => {
    const { result } = renderHook(() =>
      useTableState({
        rows,
        pageSize: 10,
        getSearchText,
        filterFn: (row) => row.status === 'HADIR',
      }),
    )

    expect(result.current.total).toBe(3)
  })
})