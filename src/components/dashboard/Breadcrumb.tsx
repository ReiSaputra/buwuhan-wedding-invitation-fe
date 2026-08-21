import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Crumb = { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight size={16} />
          {item.to ? (
            <Link to={item.to} className="transition hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {i < items.length - 1 && null}
        </span>
      ))}
    </nav>
  )
}