import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ActivityLog } from '@/types/dashboard'
import { cn } from '@/lib/cn'

function LogRow({ log }: { log: ActivityLog }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="flex-1 text-sm text-ink">{log.message}</span>
        <span className="shrink-0 text-xs text-muted">{log.createdAt}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && log.detail && (
        <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
          {log.detail}
        </div>
      )}
    </div>
  )
}

export function ActivityLogList({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted">
        Belum ada aktivitas.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <LogRow key={log.id} log={log} />
      ))}
    </div>
  )
}