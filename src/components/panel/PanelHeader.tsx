import { useState } from 'react'
import { Copy, Check, ExternalLink, Calendar, Sparkles } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { Button } from '@/components/ui/Button'
import { getDaysRemaining } from '@/lib/format'

dayjs.locale('id')

export type PanelHeaderProps = {
  /** Nama pasangan mempelai pengantin */
  coupleName: string
  /** Tanggal pelaksanaan acara pernikahan (format YYYY-MM-DD) */
  eventDate: string
  /** Slug URL publik undangan */
  slug: string
}

/**
 * Komponen Header Panel Undangan Spesifik.
 * Menampilkan nama pasangan dengan tipografi mewah, hitung mundur hari acara,
 * tombol salin tautan undangan dengan umpan balik, dan tautan langsung ke website tamu.
 * 
 * @param props - Properti PanelHeader (coupleName, eventDate, slug)
 */
export function PanelHeader({ coupleName, eventDate, slug }: PanelHeaderProps) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}/undangan/${slug}`
  const daysLeft = getDaysRemaining(eventDate)

  /**
   * Menyalin tautan undangan ke clipboard pengguna.
   */
  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card-hover-effect relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-border shadow-xs">
      {/* Ornamen latar belakang */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-indigo-50/60 blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles size={11} className="text-amber-500" />
            <span>Panel Acara Pernikahan</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {coupleName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Calendar size={14} className="text-primary" />
              {dayjs(eventDate).format('D MMMM YYYY')}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              {daysLeft > 0 ? `${daysLeft} Hari Lagi` : 'Hari Ini'}
            </span>
          </div>
        </div>

        {/* Tombol Aksi Tautan */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
            onClick={handleCopy}
          >
            {copied ? 'Link Tersalin!' : 'Salin Link Undangan'}
          </Button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition cursor-pointer active:scale-95"
          >
            <ExternalLink size={15} />
            <span>Lihat Website</span>
          </a>
        </div>
      </div>
    </div>
  )
}