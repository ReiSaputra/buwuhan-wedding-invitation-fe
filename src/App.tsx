import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { PageLoader } from '@/components/common/PageLoader'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'

// Layout tetap dimuat langsung karena ukurannya kecil dan selalu dipakai
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import PanelLayout from '@/layouts/PanelLayout'
import PlainLayout from '@/layouts/PlainLayout'

// Halaman dipecah menjadi bundle terpisah (code splitting) agar bundle awal ringan
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const BerandaPage = lazy(() => import('@/pages/dashboard/BerandaPage'))
const UndanganPage = lazy(() => import('@/pages/dashboard/UndanganPage'))
const LanggananPage = lazy(() => import('@/pages/dashboard/LanggananPage'))
const BuwuhPage = lazy(() => import('@/pages/dashboard/BuwuhPage'))
const PengaturanPage = lazy(() => import('@/pages/dashboard/PengaturanPage'))
const PanelBerandaPage = lazy(() => import('@/pages/panel/PanelBerandaPage'))
const PanelPlaceholderPage = lazy(() => import('@/pages/panel/PanelPlaceholderPage'))
const PanelEditPage = lazy(() => import('@/pages/panel/PanelEditPage'))
const PanelRsvpPage = lazy(() => import('@/pages/panel/PanelRsvpPage'))
const PanelBukuTamuPage = lazy(() => import('@/pages/panel/PanelBukuTamuPage'))
const PanelHadiahPage = lazy(() => import('@/pages/panel/PanelHadiahPage'))
const PanelTemplatePage = lazy(() => import('@/pages/panel/PanelTemplatePage'))
const PanelScanQrPage = lazy(() => import('@/pages/panel/PanelScanQrPage'))
const InvitationPage = lazy(() => import('@/pages/InvitationPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PanelCatatanBuwuhPage = lazy(() => import('@/pages/panel/PanelCatatanBuwuhPage'))

/**
 * Layout Akar (RootLayout).
 * Membungkus seluruh aplikasi dengan ErrorBoundary, AuthProvider, dan Suspense.
 */
function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}

/**
 * Konfigurasi Router Data Aplikasi.
 * Menggunakan createBrowserRouter agar mendukung hook useBlocker untuk
 * pencegahan kehilangan data saat berpindah rute (unsaved changes guard).
 */
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
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
          <Route path="template" element={<PanelTemplatePage />} />
          <Route path="buku-tamu" element={<PanelBukuTamuPage />} />
          <Route path="rsvp" element={<PanelRsvpPage />} />
          <Route path="hadiah" element={<PanelHadiahPage />} />
          <Route path="catatan-buwuh" element={<PanelCatatanBuwuhPage />} />
          <Route path="scan-qr" element={<PanelScanQrPage />} />
        </Route>
      </Route>

      {/* Halaman undangan publik untuk tamu resepsi (tanpa proteksi login) */}
      <Route path="/undangan/:slug" element={<InvitationPage />} />

      {/* Fallback rute: tampilkan 404, JANGAN redirect ke dashboard */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
)

/**
 * Komponen Utama Aplikasi (App).
 */
export default function App() {
  return <RouterProvider router={router} />
}