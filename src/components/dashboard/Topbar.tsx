import { Bell } from 'lucide-react'
import { useClock } from '@/hooks/useClock'
import { PlanBadge } from './PlanBadge'
import type { CurrentUser } from '@/types/dashboard'

export function Topbar({ user }: { user: CurrentUser }) {
  const clock = useClock()

  return (
    <header className="flex items-center justify-between gap-4 px-8 pt-6">
      <span className="text-sm text-muted">{clock}</span>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-lg p-2 text-muted transition hover:bg-white"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        <PlanBadge plan={user.plan} />

        <button type="button" className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-white">
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-ink">{user.fullName}</p>
            <p className="text-xs text-muted">{user.role}</p>
          </div>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {user.fullName.charAt(0)}
            </div>
          )}
        </button>
      </div>
    </header>
  )
}