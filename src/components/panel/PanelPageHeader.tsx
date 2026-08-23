import type { ReactNode } from 'react'
import { Breadcrumb, type Crumb } from '@/components/dashboard/Breadcrumb'

export type PanelPageHeaderProps = {
  /** Jejak navigasi di atas judul */
  crumbs: Crumb[]
  /** Judul halaman fitur */
  title: string
  /** Keterangan singkat di bawah judul */
  subtitle?: string
  /** Tombol aksi di sisi kanan judul */
  actions?: ReactNode
}

/**
 * Header standar untuk setiap halaman fitur di dalam panel undangan.
 * Menjaga posisi breadcrumb, judul, subjudul, dan tombol aksi tetap konsisten
 * di halaman RSVP, Buku Tamu, Hadiah, dan fitur lain berikutnya.
 *
 * @param props - Properti PanelPageHeader (crumbs, title, subtitle, actions)
 */
export function PanelPageHeader({
  crumbs,
  title,
  subtitle,
  actions,
}: PanelPageHeaderProps) {
  return (
    <div className="space-y-4">
      <Breadcrumb items={crumbs} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
