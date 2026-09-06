import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { ImageUploadInput } from '@/components/ui/ImageUploadInput'
import {
  useUserProfile,
  useUpdateProfile,
  useChangePassword,
  useChangeEmail,
  useDeleteAccount,
  useUserSessions,
  useRevokeOtherSessions,
} from '@/hooks/useUser'
import {
  User,
  Lock,
  Bell,
  Check,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  Mail,
  Crown,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  X,
} from 'lucide-react'

/**
 * Halaman Pengaturan Akun Dashboard.
 * Menyediakan form pengaturan profil pengguna, avatar, keamanan & ubah kata sandi,
 * manajemen sesi login aktif, preferensi notifikasi WhatsApp, serta zona hapus akun.
 */
export default function PengaturanPage() {
  const { data: userProfile } = useUserProfile()
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile()
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword()
  const { mutateAsync: changeEmail, isPending: isChangingEmail } = useChangeEmail()
  const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount()
  const { data: sessions = [] } = useUserSessions()
  const { mutateAsync: revokeSessions, isPending: isRevokingSessions } = useRevokeOtherSessions()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'danger'>('profile')

  // Feedback status
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null)
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null)

  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null)
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null)

  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null)
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState<string | null>(null)

  // Profile Form state
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [notifyRsvpWa, setNotifyRsvpWa] = useState(true)
  const [notifyBuwuhWa, setNotifyBuwuhWa] = useState(true)
  const [notifyMarketing, setNotifyMarketing] = useState(false)

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Modal Email
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailModalError, setEmailModalError] = useState<string | null>(null)
  const [emailModalSuccess, setEmailModalSuccess] = useState<string | null>(null)

  // Modal Delete Account
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null)

  // Synchronize state when data loads
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '')
      setNickname(userProfile.nickname || '')
      setPhone(userProfile.phone || '')
      setAvatarUrl(userProfile.avatarUrl || '')
      setNotifyRsvpWa(userProfile.notifyRsvpWa ?? true)
      setNotifyBuwuhWa(userProfile.notifyBuwuhWa ?? true)
      setNotifyMarketing(userProfile.notifyMarketing ?? false)
    }
  }, [userProfile])

  /**
   * Simpan profil utama
   */
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSuccessMsg(null)
    setProfileErrorMsg(null)

    if (!fullName.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong')
      return
    }

    try {
      await updateProfile({
        fullName: fullName.trim(),
        nickname: nickname.trim() || undefined,
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || null,
      })
      setProfileSuccessMsg('Profil pengguna berhasil diperbarui!')
      setTimeout(() => setProfileSuccessMsg(null), 3000)
    } catch (err: unknown) {
      setProfileErrorMsg((err as Error)?.message || 'Gagal menyimpan perubahan profil')
    }
  }

  /**
   * Simpan preferensi notifikasi
   */
  async function handleSaveNotifications(e: React.FormEvent) {
    e.preventDefault()
    setNotifSuccessMsg(null)

    try {
      await updateProfile({
        notifyRsvpWa,
        notifyBuwuhWa,
        notifyMarketing,
      })
      setNotifSuccessMsg('Preferensi notifikasi WhatsApp berhasil disimpan!')
      setTimeout(() => setNotifSuccessMsg(null), 3000)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal menyimpan preferensi')
    }
  }

  /**
   * Simpan password baru
   */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordSuccessMsg(null)
    setPasswordErrorMsg(null)

    if (!currentPassword) {
      setPasswordErrorMsg('Masukkan kata sandi lama Anda')
      return
    }
    if (newPassword.length < 8) {
      setPasswordErrorMsg('Kata sandi baru minimal 8 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi baru tidak cocok')
      return
    }

    try {
      await changePassword({ currentPassword, newPassword })
      setPasswordSuccessMsg('Kata sandi berhasil diperbarui!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccessMsg(null), 3500)
    } catch (err: unknown) {
      setPasswordErrorMsg((err as Error)?.message || 'Gagal memperbarui kata sandi. Pastikan password lama sesuai.')
    }
  }

  /**
   * Simpan permintaan ubah email
   */
  async function handleChangeEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailModalError(null)
    setEmailModalSuccess(null)

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailModalError('Masukkan format alamat email yang valid')
      return
    }

    try {
      await changeEmail({ newEmail: newEmail.trim() })
      setEmailModalSuccess(`Permintaan pembaruan email dikirim ke ${newEmail}.`)
      setTimeout(() => {
        setIsEmailModalOpen(false)
        setEmailModalSuccess(null)
        setNewEmail('')
      }, 2000)
    } catch (err: unknown) {
      setEmailModalError((err as Error)?.message || 'Gagal mengubah email')
    }
  }

  /**
   * Hapus akun pengguna
   */
  async function handleDeleteAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDeleteErrorMsg(null)

    if (deleteConfirmationText !== 'HAPUS AKUN') {
      setDeleteErrorMsg('Ketik "HAPUS AKUN" dengan huruf kapital untuk konfirmasi')
      return
    }

    try {
      await deleteAccount({ password: deletePassword })
    } catch (err: unknown) {
      setDeleteErrorMsg((err as Error)?.message || 'Gagal menghapus akun. Pastikan kata sandi Anda benar.')
    }
  }

  /**
   * Putuskan sesi lain
   */
  async function handleRevokeSessions() {
    if (!window.confirm('Yakin ingin mengeluarkan akun dari semua perangkat lain?')) return
    try {
      await revokeSessions()
      setSessionSuccessMsg('Semua sesi login di perangkat lain telah diputus.')
      setTimeout(() => setSessionSuccessMsg(null), 3000)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal memutuskan sesi')
    }
  }

  const isProOrMax = userProfile?.planTier === 'PRO' || userProfile?.planTier === 'MAX'

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Pengaturan' }]} />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pengaturan Akun</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Kelola profil pengguna, foto avatar, keamanan kata sandi, dan preferensi notifikasi Anda.
            </p>
          </div>

          {/* Badge Paket Pengguna */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-2 text-xs font-semibold text-violet-800 self-start sm:self-auto">
            <Crown size={16} className={isProOrMax ? 'text-amber-500' : 'text-violet-500'} />
            <span>Paket Aktif: <strong>{userProfile?.planTier || 'FREE'}</strong></span>
            <Link
              to="/dashboard/langganan"
              className="ml-1 text-violet-600 hover:text-violet-800 underline font-bold"
            >
              Kelola
            </Link>
          </div>
        </div>

        {/* Tab Navigasi Pengaturan */}
        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            <User size={16} />
            <span>Profil Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            <Lock size={16} />
            <span>Keamanan & Sesi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            <Bell size={16} />
            <span>Notifikasi WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'danger'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-red-600'
            }`}
          >
            <Trash2 size={16} />
            <span>Zona Bahaya</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL PENGGUNA */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl bg-white p-6 border border-border shadow-xs max-w-3xl animate-in fade-in duration-200">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {profileErrorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {/* Unggah Avatar Foto Profil */}
            <div>
              <label className="block text-xs font-bold text-ink mb-2">Foto Profil (Avatar)</label>
              <ImageUploadInput
                value={avatarUrl}
                onChange={setAvatarUrl}
                label="Pilih Foto Profil"
                helperText="Mendukung JPG, PNG, atau WebP (Maks. 5MB)"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Raden Mas Danang"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Nama Panggilan / Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Danang"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-ink">Alamat Email</label>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Ubah Email
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck size={14} /> Terverifikasi
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Nomor WhatsApp Aktif</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted">Digunakan untuk integrasi pesan otomatis dan notifikasi.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {profileSuccessMsg ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                  <Check size={16} /> {profileSuccessMsg}
                </span>
              ) : (
                <span />
              )}
              <Button type="submit" variant="primary" size="md" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Menyimpan...
                  </span>
                ) : (
                  'Simpan Perubahan Profil'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KEAMANAN, KATA SANDI & SESI */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
          {/* Form Ganti Kata Sandi */}
          <div className="rounded-2xl bg-white p-6 border border-border shadow-xs">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <KeyRound size={18} className="text-primary" />
              <span>Perbarui Kata Sandi Akun</span>
            </h2>
            <p className="mt-1 text-xs text-muted">
              Pastikan Anda menggunakan kata sandi unik dan kuat untuk melindungi akun dan data acara Anda.
            </p>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              {passwordErrorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    className="w-full rounded-xl border border-slate-200 p-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-ink cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-xl border border-slate-200 p-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-ink cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {passwordSuccessMsg ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                    <Check size={16} /> {passwordSuccessMsg}
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" variant="primary" size="md" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </span>
                  ) : (
                    'Perbarui Kata Sandi'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Daftar Sesi Login Aktif */}
          <div className="rounded-2xl bg-white p-6 border border-border shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  <span>Sesi Login & Perangkat Aktif</span>
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Daftar perangkat yang saat ini memiliki akses aktif ke akun Buwuhan Anda.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRevokeSessions}
                disabled={isRevokingSessions}
                className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer self-start sm:self-auto"
              >
                <LogOut size={14} className="mr-1.5" />
                {isRevokingSessions ? 'Memutuskan...' : 'Keluarkan Perangkat Lain'}
              </Button>
            </div>

            {sessionSuccessMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 animate-in fade-in">
                <Check size={16} className="shrink-0" />
                <span>{sessionSuccessMsg}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    sess.isCurrent
                      ? 'border-indigo-200 bg-indigo-50/40'
                      : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {sess.device.toLowerCase().includes('phone') || sess.device.toLowerCase().includes('safari mobile') ? (
                        <Smartphone size={20} />
                      ) : (
                        <Laptop size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-ink">{sess.device}</strong>
                        {sess.isCurrent && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Sesi Saat Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted">
                        IP: {sess.ipAddress} &bull; Terakhir aktif: {new Date(sess.lastActiveAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFIKASI WHATSAPP */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="rounded-2xl bg-white p-6 border border-border shadow-xs max-w-3xl animate-in fade-in duration-200">
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-ink">Preferensi Notifikasi WhatsApp</h2>
              <p className="mt-1 text-xs text-muted">
                Pilih pesan WhatsApp apa saja yang ingin Anda terima di nomor <strong>{phone || 'belum diisi'}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-ink cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={notifyRsvpWa}
                  onChange={(e) => setNotifyRsvpWa(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <strong className="block text-xs sm:text-sm font-bold text-ink">Notifikasi RSVP Kehadiran Tamu</strong>
                  <span className="text-muted text-[11px] leading-relaxed">
                    Kirim pesan instan setiap kali ada tamu undangan yang mengisi formulir konfirmasi kehadiran.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-ink cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={notifyBuwuhWa}
                  onChange={(e) => setNotifyBuwuhWa(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <strong className="block text-xs sm:text-sm font-bold text-ink">Notifikasi Hadiah & Buwuhan Digital</strong>
                  <span className="text-muted text-[11px] leading-relaxed">
                    Kirim ringkasan saat ada tamu yang mengirim amplop digital atau hadiah pernikahan terkonfirmasi.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-xs text-ink cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={notifyMarketing}
                  onChange={(e) => setNotifyMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <strong className="block text-xs sm:text-sm font-bold text-ink">Tips & Informasi Pembaruan Buwuhan</strong>
                  <span className="text-muted text-[11px] leading-relaxed">
                    Terima info fitur baru, promo langganan eksklusif, dan tips pengelolaan resepsi pernikahan.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {notifSuccessMsg ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                  <Check size={16} /> {notifSuccessMsg}
                </span>
              ) : (
                <span />
              )}
              <Button type="submit" variant="primary" size="md" disabled={isUpdatingProfile}>
                Simpan Preferensi Notifikasi
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ZONA BAHAYA (HAPUS AKUN) */}
      {/* ========================================================================= */}
      {activeTab === 'danger' && (
        <div className="rounded-2xl bg-white p-6 border border-red-200 shadow-xs max-w-3xl animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-900">Hapus Akun Buwuhan</h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Setelah akun dihapus, seluruh data undangan Anda, daftar tamu, RSVP,
                riwayat catatan buwuhan, dan berkas foto akan dihapus secara permanen atau dianonimkan dari peladen.
              </p>

              <div className="mt-5">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                >
                  <Trash2 size={16} className="mr-2" />
                  Hapus Akun Saya
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UBAH EMAIL */}
      {/* ========================================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Mail size={18} className="text-primary" />
                <span>Ubah Alamat Email</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangeEmailSubmit} className="mt-4 space-y-4">
              {emailModalError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{emailModalError}</span>
                </div>
              )}

              {emailModalSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                  <Check size={16} className="shrink-0" />
                  <span>{emailModalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Alamat Email Baru</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-muted">
                  Tautan konfirmasi verifikasi akan dikirimkan ke alamat email baru ini.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEmailModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isChangingEmail}>
                  {isChangingEmail ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Mengirim...
                    </span>
                  ) : (
                    'Kirim Permintaan'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS AKUN */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200">
            <div className="flex items-center justify-between pb-4 border-b border-red-100">
              <div className="flex items-center gap-2 font-bold text-red-700">
                <AlertTriangle size={20} />
                <span>Konfirmasi Hapus Akun</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} className="mt-4 space-y-4">
              {deleteErrorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{deleteErrorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Untuk mencegah penghapusan yang tidak disengaja, silakan ketik <strong className="text-red-700">HAPUS AKUN</strong> dan masukkan kata sandi Anda di bawah ini:
              </p>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Teks Konfirmasi</label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Ketik HAPUS AKUN"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Kata Sandi Anda</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isDeletingAccount || deleteConfirmationText !== 'HAPUS AKUN'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeletingAccount ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Menghapus...
                    </span>
                  ) : (
                    'Ya, Hapus Akun'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}