import type { ReactNode } from 'react'

export type TableCardProps = {
  /** Judul kartu tabel, misal "Daftar Tamu" */
  title?: string
  /** Elemen di sisi kanan judul: pencarian, filter, tombol aksi */
  toolbar?: ReactNode
  /** Isi tabel */
  children: ReactNode
  /** Teks kiri pada footer, biasanya keterangan jumlah data */
  footerLeft?: ReactNode
  /** Elemen kanan pada footer, biasanya paginasi */
  footerRight?: ReactNode
}

/**
 * Rangka kartu pembungkus tabel data.
 * Menyatukan header (judul + toolbar), badan tabel yang bisa digulir
 * horizontal di layar kecil, serta footer keterangan dan paginasi.
 *
 * Dipakai bersama oleh RSVP, Buku Tamu, dan Hadiah agar tampilan tabel
 * di seluruh panel tetap seragam.
 *
 * @param props - Properti TableCard (title, toolbar, children, footerLeft, footerRight)
 */
export function TableCard({
  title,
  toolbar,
  children,
  footerLeft,
  footerRight,
}: TableCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      {(title || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <h2 className="font-display text-base font-bold text-ink shrink-0">{title}</h2>
          )}
          {toolbar && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
              {toolbar}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">{children}</div>

      {(footerLeft || footerRight) && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted">{footerLeft}</span>
          {footerRight}
        </div>
      )}
    </div>
  )
}
