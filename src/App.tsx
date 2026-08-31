import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import PanelLayout from '@/layouts/PanelLayout'
import PlainLayout from '@/layouts/PlainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import BerandaPage from '@/pages/dashboard/BerandaPage'
import UndanganPage from '@/pages/dashboard/UndanganPage'
import LanggananPage from '@/pages/dashboard/LanggananPage'
import BuwuhPage from '@/pages/dashboard/BuwuhPage'
import PengaturanPage from '@/pages/dashboard/PengaturanPage'
import PanelBerandaPage from '@/pages/panel/PanelBerandaPage'
import PanelPlaceholderPage from '@/pages/panel/PanelPlaceholderPage'
import PanelEditPage from '@/pages/panel/PanelEditPage'
import PanelRsvpPage from '@/pages/panel/PanelRsvpPage'
import PanelBukuTamuPage from '@/pages/panel/PanelBukuTamuPage'
import PanelHadiahPage from '@/pages/panel/PanelHadiahPage'
import InvitationPage from '@/pages/InvitationPage'

/**
 * Komponen Utama Aplikasi (App).
 * Membungkus pohon komponen dengan AuthProvider untuk mengelola sesi in-memory,
 * serta mendefinisikan rute publik (undangan), rute tamu (login/register), dan rute terproteksi (dashboard).
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rute Khusus Tamu / Belum Login (Sign In & Sign Up) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Rute Privat Dashboard yang Dilindungi ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          {/* Halaman penuh tanpa sidebar */}
          <Route element={<PlainLayout />}>
            <Route path="/dashboard/langganan" element={<LanggananPage />} />
          </Route>

          {/* Dashboard utama */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<BerandaPage />} />
            <Route path="undangan" element={<UndanganPage />} />
            <Route path="buwuh" element={<BuwuhPage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
          </Route>

          {/* Panel per undangan — sidebar kontekstual */}
          <Route path="/dashboard/undangan/:id" element={<PanelLayout />}>
            <Route index element={<PanelBerandaPage />} />
            <Route path="edit" element={<PanelEditPage />} />
            <Route path="petugas" element={<PanelPlaceholderPage title="Petugas" />} />
            <Route path="template" element={<PanelPlaceholderPage title="Template" />} />
            <Route path="buku-tamu" element={<PanelBukuTamuPage />} />
            <Route path="rsvp" element={<PanelRsvpPage />} />
            <Route path="hadiah" element={<PanelHadiahPage />} />
            <Route path="catatan-buwuh" element={<PanelPlaceholderPage title="Catatan Buwuh" />} />
            <Route path="scan-qr" element={<PanelPlaceholderPage title="Scan QR" />} />
          </Route>
        </Route>

        {/* Halaman undangan publik untuk tamu resepsi (tanpa proteksi login) */}
        <Route path="/undangan/:slug" element={<InvitationPage />} />

        {/* Fallback rute */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}