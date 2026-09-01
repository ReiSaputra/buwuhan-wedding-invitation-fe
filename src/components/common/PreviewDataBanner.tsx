import { FlaskConical } from 'lucide-react'

export type PreviewDataBannerProps = {
  /** Nama fitur yang belum tersambung ke backend */
  featureName: string
  /** Keterangan singkat apa yang masih dibutuhkan */
  detail?: string
}

/**
 * Spanduk penanda bahwa data pada halaman ini masih contoh (belum nyata)
 * karena endpoint backend-nya belum tersedia. Dipasang agar tidak ada
 * kekeliruan menganggap angka di halaman ini sebagai data produksi.
 */
export function PreviewDataBanner({ featureName, detail }: PreviewDataBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <FlaskConical size={16} className="mt-0.5 shrink-0 text-amber-600" />
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-amber-900">
          Data contoh — {featureName} belum tersambung ke server
        </p>
        <p className="text-[11px] leading-relaxed text-amber-700">
          {detail ??
            'Angka di halaman ini hanya pratinjau tampilan dan belum mencerminkan data sebenarnya.'}
        </p>
      </div>
    </div>
  )
}