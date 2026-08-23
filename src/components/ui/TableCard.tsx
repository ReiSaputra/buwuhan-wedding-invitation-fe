import type { ReactNode } from 'react'

export type TableCardProps = {
  /** Judul kartu tabel (misal: "Daftar Tamu", "Riwayat Pemberian") */
  title?: string
  /** Elemen di sisi kanan header: input pencarian, filter dropdown, dan tombol aksi */
  toolbar?: ReactNode
  /** Elemen isi tabel (elemen <table> atau data grid) */
  children: ReactNode
  /** Teks di sisi kiri footer, biasanya keterangan jumlah entri data */
  footerLeft?: ReactNode
  /** Elemen di sisi kanan footer, biasanya komponen Pagination */
  footerRight?: ReactNode
}

/**
 * Komponen Rangka Kartu Pembungkus Tabel Data (TableCard).
 * Menyatukan header (judul + toolbar kontrol), badan tabel yang responsif
 * (bisa digulir horizontal di layar smartphone), serta footer ringkasan dan paginasi.
 * 
 * @param props - Properti TableCard (title, toolbar, children, footerLeft, footerRight)
 * 
 * @example
 * <TableCard title="Daftar Tamu" toolbar={<SearchInput ... />}>
 *   <table>...</table>
 * </TableCard>
 */
export function TableCard({
  title,
  toolbar,
  children,
  footerLeft,
  footerRight,
}: TableCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition-all">
      {(title || toolbar) && (
        <div className="flex flex-col gap-3.5 border-b border-slate-100 px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between bg-slate-50/40">
          {title && (
            <h2 className="font-display text-base font-bold text-ink shrink-0 tracking-tight">
              {title}
            </h2>
          )}
          {toolbar && (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5 w-full sm:w-auto">
              {toolbar}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">{children}</div>

      {(footerLeft || footerRight) && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/30">
          <span className="text-xs font-medium text-muted">{footerLeft}</span>
          {footerRight}
        </div>
      )}
    </div>
  )
}

