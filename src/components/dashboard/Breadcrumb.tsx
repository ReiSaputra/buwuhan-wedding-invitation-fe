import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Crumb = {
  /** Label teks breadcrumb */
  label: string
  /** URL tautan halaman (kosongkan jika merupakan halaman aktif saat ini) */
  to?: string
}

export type BreadcrumbProps = {
  /** Daftar elemen navigasi breadcrumb */
  items: Crumb[]
}

/**
 * Komponen navigasi jejak remah roti (Breadcrumb).
 * Memudahkan user mengetahui posisi hierarki halaman saat ini.
 * 
 * @param props - Properti Breadcrumb (items)
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-slate-500 transition hover:text-primary"
        title="Kembali ke Dashboard Utama"
      >
        <Home size={14} />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1

        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            {item.to && !isLast ? (
              <Link to={item.to} className="text-slate-600 transition hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink font-semibold">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}