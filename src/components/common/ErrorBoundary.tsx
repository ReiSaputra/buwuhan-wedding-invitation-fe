import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  message: string
}

/**
 * Komponen penangkap galat render (Error Boundary).
 * Mencegah satu komponen yang gagal me-render membuat seluruh aplikasi
 * menjadi layar putih kosong. React hanya mendukung fitur ini melalui
 * class component, sehingga file ini sengaja tidak memakai hook.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ganti bagian ini dengan pengiriman ke layanan monitoring (Sentry, dll)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  /** Mengembalikan aplikasi ke kondisi normal tanpa memuat ulang halaman penuh. */
  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <AlertTriangle size={32} className="mx-auto text-amber-500" />

          <div className="space-y-1.5">
            <h1 className="font-display text-lg font-bold text-ink">
              Terjadi kesalahan tak terduga
            </h1>
            <p className="text-xs leading-relaxed text-slate-500">
              Halaman ini gagal ditampilkan. Silakan coba lagi, atau muat ulang
              halaman bila masalah berlanjut.
            </p>
          </div>

          <p className="rounded-xl bg-slate-50 p-3 text-left font-mono text-[11px] break-words text-slate-500">
            {this.state.message || 'Unknown error'}
          </p>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <RotateCcw size={14} />
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    )
  }
}