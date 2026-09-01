import { Loader2 } from 'lucide-react'

/**
 * Indikator muat halaman yang dipakai sebagai fallback React.Suspense
 * selama bundle halaman yang di-lazy-load sedang diunduh.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-3 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-primary" />
        <p className="text-xs font-medium text-slate-400">Memuat halaman…</p>
      </div>
    </div>
  )
}