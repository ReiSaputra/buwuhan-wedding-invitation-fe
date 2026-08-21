import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  to: string
  icon: ReactNode
  label: string
  end?: boolean
}

export function NavItem({ to, icon, label, end = false }: Props) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition',
          isActive
            ? 'bg-primary-light text-white font-semibold shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </NavLink>
  )
}