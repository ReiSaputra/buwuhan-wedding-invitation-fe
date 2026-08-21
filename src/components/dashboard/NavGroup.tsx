import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { NavGroupDef } from '@/config/navigation'
import { cn } from '@/lib/cn'

export function NavGroup({ group }: { group: NavGroupDef }) {
  const { pathname } = useLocation()
  const hasActiveChild = group.children.some((c) => pathname === c.to)
  const [isOpen, setIsOpen] = useState(hasActiveChild)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition',
          hasActiveChild ? 'text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
        )}
      >
        <span className="shrink-0">{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          size={16}
          className={cn('transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-1 pl-6">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-4 py-2 text-sm transition',
                  isActive
                    ? 'bg-white/15 font-semibold text-white'
                    : 'text-white/60 hover:text-white',
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}