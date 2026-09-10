import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoader } from "@/components/common/PageLoader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { useAuth } from "@/hooks/useAuth";

// Layout tetap dimuat langsung karena ukurannya kecil dan selalu dipakai
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import PanelLayout from "@/layouts/PanelLayout";
import PlainLayout from "@/layouts/PlainLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Halaman dipecah menjadi bundle terpisah (code splitting) agar bundle awal ringan
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const BerandaPage = lazy(() => import("@/pages/dashboard/BerandaPage"));
const UndanganPage = lazy(() => import("@/pages/dashboard/UndanganPage"));
const LanggananPage = lazy(() => import("@/pages/dashboard/LanggananPage"));
const BuwuhPage = lazy(() => import("@/pages/dashboard/BuwuhPage"));
const PengaturanPage = lazy(() => import("@/pages/dashboard/PengaturanPage"));
const PanelBerandaPage = lazy(() => import("@/pages/panel/PanelBerandaPage"));
const PanelPetugasPage = lazy(() => import("@/pages/panel/PanelPetugasPage"));
const PanelEditPage = lazy(() => import("@/pages/panel/PanelEditPage"));
const PanelRsvpPage = lazy(() => import("@/pages/panel/PanelRsvpPage"));
const PanelBukuTamuPage = lazy(() => import("@/pages/panel/PanelBukuTamuPage"));
const PanelHadiahPage = lazy(() => import("@/pages/panel/PanelHadiahPage"));
const PanelTemplatePage = lazy(() => import("@/pages/panel/PanelTemplatePage"));
const PanelScanQrPage = lazy(() => import("@/pages/panel/PanelScanQrPage"));
const InvitationPage = lazy(() => import("@/pages/InvitationPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const PanelCatatanBuwuhPage = lazy(
  () => import("@/pages/panel/PanelCatatanBuwuhPage"),
);
const JoinInvitationPage = lazy(
  () => import("@/pages/panel/JoinInvitationPage"),
);

// Halaman Admin Platform Buwuhan
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminUserDetailPage = lazy(
  () => import("@/pages/admin/AdminUserDetailPage"),
);
const AdminInvitationsPage = lazy(
  () => import("@/pages/admin/AdminInvitationsPage"),
);
const AdminTemplatesPage = lazy(
  () => import("@/pages/admin/AdminTemplatesPage"),
);
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));
const AdminSubscriptionsPage = lazy(
  () => import("@/pages/admin/AdminSubscriptionsPage"),
);

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
  );
}

/**
 * Pengalihan cerdas rute akar (/) berdasarkan peran pengguna.
 * Jika pengguna memiliki peran ADMIN, diarahkan langsung ke Portal Superadmin.
 */
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

// Router sengaja diekspor dari file ini agar bisa dipakai pada pengujian.
// Aturan Fast Refresh dimatikan karena file ini memang berisi definisi rute
// sekaligus komponen App — memisahkannya justru memicu error yang lebih banyak.
// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter(  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<RootRedirect />} />

      {/* Rute Khusus Tamu / Belum Login (Sign In, Sign Up, Lupa Password, Reset, Verifikasi) */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
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

        {/* Halaman terima undangan petugas (tujuan tautan email dari backend).
    HARUS didaftarkan sebelum rute dinamis :id agar "join" tidak
    dianggap sebagai ID undangan. */}
        <Route element={<PlainLayout />}>
          <Route
            path="/dashboard/undangan/join"
            element={<JoinInvitationPage />}
          />
          <Route
            path="/invitations/accept"
            element={<JoinInvitationPage />}
          />
        </Route>

        {/* Panel per undangan — sidebar kontekstual */}
        <Route path="/dashboard/undangan/:id" element={<PanelLayout />}>
          <Route index element={<PanelBerandaPage />} />
          <Route path="edit" element={<PanelEditPage />} />
          <Route path="petugas" element={<PanelPetugasPage />} />
          <Route path="template" element={<PanelTemplatePage />} />
          <Route path="buku-tamu" element={<PanelBukuTamuPage />} />
          <Route path="rsvp" element={<PanelRsvpPage />} />
          <Route path="hadiah" element={<PanelHadiahPage />} />
          <Route path="catatan-buwuh" element={<PanelCatatanBuwuhPage />} />
          <Route path="scan-qr" element={<PanelScanQrPage />} />
        </Route>
      </Route>

      {/* Rute Khusus Superadmin Platform (Dilindungi AdminRoute role === ADMIN) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="invitations" element={<AdminInvitationsPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="langganan" element={<AdminSubscriptionsPage />} />
          <Route path="pengaturan" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Halaman undangan publik untuk tamu resepsi (tanpa proteksi login) */}
      <Route path="/undangan/:slug" element={<InvitationPage />} />

      {/* Fallback rute: tampilkan 404, JANGAN redirect ke dashboard */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

/**
 * Komponen Utama Aplikasi (App).
 */
export default function App() {
  return <RouterProvider router={router} />;
}
