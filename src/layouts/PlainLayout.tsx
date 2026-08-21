import { Outlet } from 'react-router-dom'
import { BackButton } from '@/components/ui/BackButton'

/**
 * Layout halaman polos tanpa sidebar (misal untuk alur checkout paket langganan).
 * Menyediakan tombol kembali dan area tengah yang fokus.
 */
export default function PlainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Aksen Garis Gradasi Atas */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

      {/* Header Tombol Kembali */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <BackButton fallbackTo="/dashboard" label="Kembali ke Dashboard" />
      </header>

      {/* Konten Halaman */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 pt-4">
        <Outlet />
      </main>
    </div>
  )
}