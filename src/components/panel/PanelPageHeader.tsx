import type { ReactNode } from 'react'
import { Breadcrumb, type Crumb } from '@/components/dashboard/Breadcrumb'

export type PanelPageHeaderProps = {
  /** Jejak remah roti navigasi halaman */
  crumbs: Crumb[]
  /** Judul utama halaman panel fitur */
  title: string
  /** Subjudul atau deskripsi singkat di bawah judul utama */
  subtitle?: string
  /** Kumpulan tombol aksi cepat di sisi kanan judul */
  actions?: ReactNode
}

/**
 * Komponen Header Standar Halaman Panel Undangan (PanelPageHeader).
 * Menjaga tata letak jejak breadcrumb, judul halaman, deskripsi, serta deretan tombol aksi
 * tetap seragam di seluruh modul sub-panel (Buku Tamu, RSVP, Hadiah, Petugas, Template, dll).
 * 
 * @param props - Properti PanelPageHeader (crumbs, title, subtitle, actions)
 * 
 * @example
 * <PanelPageHeader
 *   crumbs={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Buku Tamu' }]}
 *   title="Buku Tamu"
 *   actions={<Button variant="primary">Tambah Tamu</Button>}
 * />
 */
export function PanelPageHeader({
  crumbs,
  title,
  subtitle,
  actions,
}: PanelPageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={crumbs} />

      {/* Baris Judul & Tombol Aksi */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs text-muted sm:text-sm leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

