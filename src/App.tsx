import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import PanelLayout from '@/layouts/PanelLayout'
import PlainLayout from '@/layouts/PlainLayout'
import BerandaPage from '@/pages/dashboard/BerandaPage'
import UndanganPage from '@/pages/dashboard/UndanganPage'
import LanggananPage from '@/pages/dashboard/LanggananPage'
import BuwuhPage from '@/pages/dashboard/BuwuhPage'
import PengaturanPage from '@/pages/dashboard/PengaturanPage'
import PanelBerandaPage from '@/pages/panel/PanelBerandaPage'
import PanelPlaceholderPage from '@/pages/panel/PanelPlaceholderPage'
import InvitationPage from '@/pages/InvitationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Halaman penuh tanpa sidebar */}
      <Route element={<PlainLayout />}>
        <Route path="/dashboard/langganan" element={<LanggananPage />} />
      </Route>

      {/* Dashboard utama — perhatikan: TIDAK ADA lagi route "langganan" di sini */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<BerandaPage />} />
        <Route path="undangan" element={<UndanganPage />} />
        <Route path="buwuh" element={<BuwuhPage />} />
        <Route path="pengaturan" element={<PengaturanPage />} />
      </Route>

      {/* Panel per undangan — sidebar kontekstual */}
      <Route path="/dashboard/undangan/:id" element={<PanelLayout />}>
        <Route index element={<PanelBerandaPage />} />
        <Route path="edit" element={<PanelPlaceholderPage title="Edit Undangan" />} />
        <Route path="petugas" element={<PanelPlaceholderPage title="Petugas" />} />
        <Route path="template" element={<PanelPlaceholderPage title="Template" />} />
        <Route path="buku-tamu" element={<PanelPlaceholderPage title="Buku Tamu" />} />
        <Route path="rsvp" element={<PanelPlaceholderPage title="RSVP" />} />
        <Route path="hadiah" element={<PanelPlaceholderPage title="Hadiah" />} />
        <Route path="catatan-buwuh" element={<PanelPlaceholderPage title="Catatan Buwuh" />} />
        <Route path="scan-qr" element={<PanelPlaceholderPage title="Scan QR" />} />
      </Route>

      {/* Halaman undangan untuk tamu */}
      <Route path="/undangan/:slug" element={<InvitationPage />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}