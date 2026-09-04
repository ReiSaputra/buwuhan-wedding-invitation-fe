import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Settings,
  ShieldCheck,
  User,
  Lock,
  Bell,
  KeyRound,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  Home,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

/**
 * Halaman Pengaturan Akun Administrator Platform Buwuhan (AdminSettingsPage).
 * Menyediakan konfigurasi profil Superadmin, manajemen kata sandi & otentikasi,
 * preferensi log audit & notifikasi sistem, serta monitoring sesi perangkat aktif.
 */
export default function AdminSettingsPage() {
  const { logout } = useAuth()
  const user = useCurrentUser()
  const navigate = useNavigate()

  // Tab aktif
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'audit' | 'sessions'>('profile')

  // Feedback Toast / Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  // Loading state simpan
  const [isSaving, setIsSaving] = useState(false)

  // Form State: Profil Administrator
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName || 'Super Administrator',
    nickname: user.nickname || 'Root Admin',
    email: user.email || 'admin@buwuhan.com',
    phone: '081234567890',
    department: 'Platform Engineering & Moderation',
    timezone: 'WIB (UTC+7)',
  })

  // Form State: Keamanan & Password
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: true,
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  // Form State: Preferensi Sistem & Notifikasi
  const [auditPrefs, setAuditPrefs] = useState({
    notifyNewUser: true,
    notifyNewInvitation: true,
    notifyCriticalTakedown: true,
    notifyQuotaExceeded: true,
    weeklyReportEmail: true,
    auditLogging: true,
  })

  // Modals state
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  // Trigger feedback toast helper
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Salin ID Pengguna Admin
  function handleCopyId() {
    if (user.id) {
      void navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // Simpan Perubahan Profil
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSaving(false)
    showToast('Profil administrator berhasil diperbarui.')
  }

  // Ganti Password
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!securityForm.currentPassword) {
      showToast('Kata sandi saat ini wajib diisi.')
      return
    }
    if (securityForm.newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter.')
      return
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.')
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsSaving(false)
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    })
    showToast('Kata sandi administrator berhasil diperbarui dengan aman.')
  }

  // Simpan Preferensi Audit
  async function handleSaveAuditPrefs(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    showToast('Preferensi notifikasi dan log audit platform berhasil disimpan.')
  }

  // Cabut Sesi Perangkat Lain
  async function handleConfirmRevokeSessions() {
    setIsRevoking(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsRevoking(false)
    setIsRevokeModalOpen(false)
    showToast('Seluruh sesi di perangkat lain berhasil dicabut secara instan.')
  }

  // Logout Admin
  async function handleConfirmLogout() {
    setIsLogoutModalOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notifikasi Sukses / Info */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigasi Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-1 text-slate-500 transition hover:text-indigo-600"
          title="Dashboard Admin"
        >
          <Home size={14} />
          <span>Dashboard</span>
        </Link>
        <ChevronRight size={13} className="text-slate-400 shrink-0" />
        <span className="text-slate-900 font-semibold">Pengaturan Akun</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 font-display">
            <Settings className="w-7 h-7 text-indigo-600" />
            Pengaturan Akun Superadmin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pusat konfigurasi profil, kredensial keamanan superadmin, audit sistem, dan manajemen sesi perangkat aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Keluar Sesi</span>
          </Button>
        </div>
      </div>

      {/* Hero Banner Kartu Identitas Administrator */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        {/* Dekorasi Aksen Lingkaran Cahaya */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar Superadmin */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 text-white font-display text-3xl font-extrabold shadow-xl shadow-indigo-500/30 border-2 border-indigo-400/40">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md border-2 border-slate-900"
                title="Superadmin Terverifikasi"
              >
                <ShieldCheck size={14} />
              </div>
            </div>

            {/* Nama & Info Admin */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                  {user.fullName}
                </h2>
                <Badge
                  variant="primary"
                  icon={<ShieldCheck size={12} className="text-indigo-400" />}
                  className="bg-indigo-950/80 text-indigo-300 border-indigo-700/60 font-semibold"
                >
                  SUPERADMIN
                </Badge>
                <Badge
                  variant="warning"
                  icon={<Sparkles size={12} className="text-amber-300" />}
                  className="bg-amber-950/60 text-amber-300 border-amber-600/50"
                >
                  PAKET {user.plan}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-mono">
                <span>{user.email || 'admin@buwuhan.com'}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-emerald-400 font-sans font-medium text-xs flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Sesi Aktif
                </span>
              </p>

              {/* Meta User ID dengan tombol salin */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-500">ID Admin:</span>
                <code className="rounded-md bg-slate-800/90 px-2 py-0.5 font-mono text-slate-300 border border-slate-700">
                  {user.id || 'usr_superadmin_buwuhan'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer text-[11px]"
                  title="Salin ID Pengguna"
                >
                  {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stat Ringkas Akses */}
          <div className="flex items-center gap-3 md:border-l md:border-slate-700/70 md:pl-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xs p-3.5 border border-white/10 text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tingkat Hak</p>
              <p className="text-sm font-bold text-indigo-300 mt-0.5">Root / Full</p>
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-xs p-3.5 border border-white/10 text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">2FA Security</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{twoFactorEnabled ? 'Aktif' : 'Nonaktif'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi Tab Pengaturan */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User size={16} />
          <span>Profil Pengelola</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock size={16} />
          <span>Keamanan & Sandi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell size={16} />
          <span>Preferensi & Log Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'sessions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Laptop size={16} />
          <span>Sesi & Perangkat</span>
        </button>
      </div>

      {/* KONTEN TAB 1: PROFIL PENGELOLA */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Informasi Pribadi & Kontak Administrator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Data identitas ini digunakan untuk pencatatan log audit dan verifikasi otentikasi internal pengelola.
            </p>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Panggilan / Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.nickname}
                    onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Administrator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Divisi / Peran Operasional
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Zona Waktu Kerja
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={profileForm.timezone}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan Profil</span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Ringkasan Kewenangan */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600" />
                Kewenangan Hak Akses
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akun ini dikonfigurasi dengan peran <strong className="text-slate-800">ADMIN</strong> yang memiliki hak istimewa di platform:
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mengubah tier langganan pengguna (FREE, PRO, MAX).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Promosi & demosi role pengguna (Superadmin).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Moderasi, penangguhan, dan takedown undangan publik.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Katalog template desain, aktivasi, dan pengarsipan.</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50/60 p-5 border border-indigo-100 text-xs text-indigo-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Sparkles size={14} className="text-indigo-600" /> Keamanan Kredensial
              </p>
              <p className="text-indigo-800/80 leading-relaxed text-[11px]">
                Pastikan Anda selalu menggunakan kata sandi unik yang kuat dan tidak membagikan sesi login administrator kepada pihak ketiga manapun.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KONTEN TAB 2: KEAMANAN & SANDI */}
      {activeTab === 'security' && (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Lock size={18} className="text-indigo-600" />
              Pembaruan Kata Sandi Administrator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan kata sandi kombinasi unik dengan minimal 8 karakter demi melindungi data operasional platform.
            </p>

            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={securityForm.currentPassword}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={securityForm.newPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, newPassword: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={securityForm.confirmPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist Standar Keamanan */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Kriteria Sandi Aman:</p>
                <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                  <span
                    className={`flex items-center gap-1.5 ${
                      securityForm.newPassword.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Minimal 8 karakter
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      /[0-9]/.test(securityForm.newPassword) ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Mengandung angka (0-9)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      /[A-Z]/.test(securityForm.newPassword) ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Mengandung huruf besar
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      securityForm.newPassword && securityForm.newPassword === securityForm.confirmPassword
                        ? 'text-emerald-600 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Konfirmasi sandi cocok
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityForm.revokeOtherSessions}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, revokeOtherSessions: e.target.checked })
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Cabut sesi aktif di semua browser & perangkat lain setelah kata sandi diubah</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Perbarui Kata Sandi</span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Kartu Status 2FA */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <KeyRound size={16} className="text-indigo-600" />
                  Otentikasi 2 Langkah (2FA)
                </h4>
                <Badge variant={twoFactorEnabled ? 'success' : 'warning'}>
                  {twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Lapisan proteksi ganda saat proses login superadmin untuk mencegah peretasan akun dari lokasi asing.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled)
                    showToast(
                      twoFactorEnabled
                        ? 'Otentikasi 2 langkah dinonaktifkan.'
                        : 'Otentikasi 2 langkah berhasil diaktifkan.',
                    )
                  }}
                  className={`w-full rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer border ${
                    twoFactorEnabled
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA Sekarang'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/70 p-5 border border-amber-200/70 text-xs text-amber-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert size={14} className="text-amber-700" /> Proteksi Serangan Brute-force
              </p>
              <p className="text-amber-900/80 leading-relaxed text-[11px]">
                Sistem Buwuhan secara otomatis mengunci IP penyerang bila terjadi 5 kali kegagalan input kata sandi beruntun.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KONTEN TAB 3: PREFERENSI & LOG AUDIT */}
      {activeTab === 'audit' && (
        <div className="max-w-4xl rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            Preferensi Notifikasi Operasional & Log Audit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pilih peristiwa platform apa saja yang memerlukan laporan real-time dan pencatatan riwayat audit.
          </p>

          <form onSubmit={handleSaveAuditPrefs} className="mt-6 space-y-5">
            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-800 cursor-pointer hover:bg-slate-50/70 transition">
                <input
                  type="checkbox"
                  checked={auditPrefs.notifyNewUser}
                  onChange={(e) => setAuditPrefs({ ...auditPrefs, notifyNewUser: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-slate-900">Pendaftaran Pengguna Baru</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Kirim notifikasi ringkasan otomatis setiap ada registrasi pengguna baru di platform Buwuhan.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-800 cursor-pointer hover:bg-slate-50/70 transition">
                <input
                  type="checkbox"
                  checked={auditPrefs.notifyNewInvitation}
                  onChange={(e) =>
                    setAuditPrefs({ ...auditPrefs, notifyNewInvitation: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-slate-900">Publikasi Undangan Aktif</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Kirim notifikasi ketika calon mempelai mempublikasikan undangan ke ranah publik untuk keperluan moderasi.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-800 cursor-pointer hover:bg-slate-50/70 transition">
                <input
                  type="checkbox"
                  checked={auditPrefs.notifyCriticalTakedown}
                  onChange={(e) =>
                    setAuditPrefs({ ...auditPrefs, notifyCriticalTakedown: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-slate-900">Tindakan Moderasi & Takedown Kritis</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Kirim alert prioritas tinggi saat ada undangan atau template yang dinonaktifkan atau diturunkan.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-800 cursor-pointer hover:bg-slate-50/70 transition">
                <input
                  type="checkbox"
                  checked={auditPrefs.notifyQuotaExceeded}
                  onChange={(e) =>
                    setAuditPrefs({ ...auditPrefs, notifyQuotaExceeded: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-slate-900">Lonjakan Kuota & Traffic Platform</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Beri tahu jika terjadi lonjakan drastis RSVP tamu undangan atau transaksi buwuh digital.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-800 cursor-pointer hover:bg-slate-50/70 transition">
                <input
                  type="checkbox"
                  checked={auditPrefs.weeklyReportEmail}
                  onChange={(e) =>
                    setAuditPrefs({ ...auditPrefs, weeklyReportEmail: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-slate-900">Laporan Metrik Mingguan</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Kirim rangkuman performa statistik platform mingguan langsung ke email resmi administrator.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Preferensi Sistem</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* KONTEN TAB 4: SESI & PERANGKAT */}
      {activeTab === 'sessions' && (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Laptop size={18} className="text-indigo-600" />
                  Daftar Sesi Perangkat Aktif
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pantau dan kelola browser atau perangkat yang saat ini memiliki otorisasi sesi login aktif.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevokeModalOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cabut Sesi Perangkat Lain
              </Button>
            </div>

            {/* List Sesi */}
            <div className="mt-6 space-y-3">
              {/* Sesi Saat Ini */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                    <Laptop size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Browser Chrome di Windows (Perangkat Ini)
                      </p>
                      <Badge variant="success" className="text-[10px] font-bold">
                        Aktif Sekarang
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      IP: 127.0.0.1 &bull; Localhost Development &bull; Sesi Diperbarui Baru Saja
                    </p>
                  </div>
                </div>

                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 sm:self-center">
                  <CheckCircle2 size={14} /> Terotentikasi Penuh
                </div>
              </div>

              {/* Sesi Lain (Misal Mobile) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Safari di iOS Mobile
                      </p>
                      <Badge variant="default" className="text-[10px]">
                        Siaga
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      IP: 192.168.1.10 &bull; Terakhir aktif: 3 jam yang lalu
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsRevokeModalOpen(true)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                  >
                    Cabut Sesi Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI CABUT SESI */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Cabut Sesi Perangkat Lain?"
        description="Tindakan ini akan memaksa logout seluruh sesi superadmin aktif di komputer atau ponsel lain."
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-900 border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Perangkat yang sedang Anda gunakan saat ini tidak akan terpengaruh dan sesi tetap berjalan normal.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRevokeModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isRevoking}
              onClick={handleConfirmRevokeSessions}
            >
              {isRevoking ? 'Memproses...' : 'Ya, Cabut Seluruh Sesi Lain'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI LOGOUT */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Keluar Sesi Administrator?"
        description="Anda akan diarahkan kembali ke halaman masuk platform Buwuhan."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Pastikan seluruh konfigurasi penting telah Anda simpan sebelum mengakhiri sesi kerja superadmin ini.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
              Keluar Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
