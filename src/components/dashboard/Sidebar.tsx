import { Gem } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NavItem } from './NavItem'
import { NavGroup } from './NavGroup'
import type { NavEntry } from '@/config/navigation'

type Props = {
  subtitle?: string
  items: NavEntry[]
  footer?: NavEntry[]
}

function renderEntry(entry: NavEntry) {
  if (entry.type === 'group') {
    return <NavGroup key={entry.label} group={entry} />
  }
  return (
    <NavItem
      key={entry.to}
      to={entry.to}
      icon={entry.icon}
      label={entry.label}
      end={entry.end}
    />
  )
}

export function Sidebar({ subtitle, items, footer }: Props) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-primary px-4 py-6">
      <div className="px-3 pb-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Gem size={22} className="text-white" />
          <span className="font-display text-xl font-semibold text-white">
            Buwuh Panel
          </span>
        </Link>
        {subtitle && <p className="mt-1 pl-8 text-sm text-white/60">{subtitle}</p>}
      </div>

      <div className="mb-4 h-px bg-white/15" />

      <nav className="flex flex-col gap-1 overflow-y-auto">
        {items.map(renderEntry)}
      </nav>

      {footer && footer.length > 0 && (
        <div className="mt-auto pt-4">
          <div className="mb-4 h-px bg-white/15" />
          <nav className="flex flex-col gap-1">{footer.map(renderEntry)}</nav>
        </div>
      )}
    </aside>
  )
}