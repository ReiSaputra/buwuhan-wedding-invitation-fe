import { useState } from 'react'
import { ChevronDown, MessageSquareQuote, UserCheck, Gift, Clock, Sparkles } from 'lucide-react'
import type { ActivityLog } from '@/types/dashboard'
import { cn } from '@/lib/cn'

export type ActivityLogListProps = {
  /** Daftar log aktivitas tamu */
  logs: ActivityLog[]
}

/**
 * Komponen baris log aktivitas tunggal.
 * 
 * @param props - Objek log aktivitas
 */
function LogRow({ log }: { log: ActivityLog }) {
  const [isOpen, setIsOpen] = useState(false)
  const isRsvp = log.message.toLowerCase().includes('hadir') || log.category === 'rsvp'
  const isGift = log.message.toLowerCase().includes('buwuh') || log.category === 'hadiah'

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
              isRsvp
                ? 'bg-emerald-100 text-emerald-700'
                : isGift
                ? 'bg-amber-100 text-amber-700'
                : 'bg-indigo-100 text-primary',
            )}
          >
            {isRsvp ? <UserCheck size={15} /> : isGift ? <Gift size={15} /> : <MessageSquareQuote size={15} />}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-ink truncate">{log.message}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted mt-0.5">
              <Clock size={11} />
              <span>{log.createdAt}</span>
            </div>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={cn('shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-primary')}
        />
      </button>

      {isOpen && log.detail && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs leading-relaxed text-slate-700 animate-in slide-in-from-top-1">
          <p className="font-medium italic">"{log.detail}"</p>
        </div>
      )}
    </div>
  )
}

/**
 * Komponen daftar linimasa log aktivitas interaksi tamu.
 * 
 * @param props - Properti ActivityLogList (logs)
 */
export function ActivityLogList({ logs }: ActivityLogListProps) {
  const [filter, setFilter] = useState<'ALL' | 'RSVP' | 'UCAPAN'>('ALL')

  const filteredLogs = logs.filter((l) => {
    if (filter === 'RSVP') return l.message.toLowerCase().includes('hadir')
    if (filter === 'UCAPAN') return l.message.toLowerCase().includes('ucapan')
    return true
  })

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-xs text-muted shadow-2xs">
        <Sparkles size={24} className="mx-auto text-slate-300 mb-2" />
        Belum ada aktivitas interaksi dari tamu.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 pb-1">
        {(
          [
            { key: 'ALL', label: 'Semua Aktivitas' },
            { key: 'RSVP', label: 'Konfirmasi Kehadiran' },
            { key: 'UCAPAN', label: 'Ucapan Doa' },
          ] as const

        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
              filter === tab.key
                ? 'bg-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  )
}