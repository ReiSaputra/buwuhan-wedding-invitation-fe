import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

type Props = {
  coupleName: string
  eventDate: string
  slug: string
}

export function PanelHeader({ coupleName, eventDate, slug }: Props) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}/undangan/${slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
        Undangan
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
        {coupleName}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {dayjs(eventDate).format('D MMMM YYYY')}
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface active:scale-95"
      >
        {copied ? 'Tersalin!' : 'Lihat web'}
        {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
      </button>
    </div>
  )
}