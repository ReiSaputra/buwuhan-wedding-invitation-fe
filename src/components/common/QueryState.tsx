import { Loader2, ServerCrash } from 'lucide-react'

export type QueryStateProps = {
  /** Menandakan data masih dimuat dari server */
  isLoading: boolean
  /** Menandakan permintaan gagal */
  isError: boolean
  /** Konten yang ditampilkan bila data berhasil dimuat */
  children: React.ReactNode
}

/**
 * Pembungkus sederhana untuk menampilkan indikator muat dan pesan galat
 * di halaman yang mengambil data dari backend, agar tiap halaman tidak
 * menulis ulang blok kondisi yang sama.
 */
export function QueryState({ isLoading, isError, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-white">
        <div className="space-y-3 text-center">
          <Loader2 size={26} className="mx-auto animate-spin text-primary" />
          <p className="text-xs font-medium text-slate-400">Memuat data dari server…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-white">
        <div className="max-w-xs space-y-2 text-center">
          <ServerCrash size={26} className="mx-auto text-amber-500" />
          <p className="text-xs font-semibold text-slate-600">Gagal memuat data</p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Pastikan backend aktif dan sesi Anda masih berlaku, lalu muat ulang halaman.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}