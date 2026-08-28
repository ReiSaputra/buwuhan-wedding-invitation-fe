import { useState } from 'react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { User, Lock, Bell, Check, ShieldCheck } from 'lucide-react'

/**
 * Halaman Pengaturan Akun Dashboard.
 * Menyediakan form pengaturan profil pengguna, kata sandi & keamanan,
 * serta preferensi notifikasi WhatsApp dan email.
 */
export default function PengaturanPage() {
  const user = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    nickname: user.nickname,
    email: user.email || 'admin@buwuhan.com',
    phone: '081234567890',
    notifyRsvpWa: true,
    notifyBuwuhWa: true,
    notifyMarketing: false,
  })

  /**
   * Menangani penyimpanan pengaturan akun.
   */
  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Pengaturan' }]} />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pengaturan Akun</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Kelola profil pengguna, keamanan akun, dan preferensi notifikasi Anda.
        </p>

        {/* Tab Navigasi Pengaturan */}
        <div className="mt-6 flex items-center gap-2 border-b border-slate-100">
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
            <span>Keamanan & Password</span>
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
        </div>
      </div>

      {/* Konten Form Berdasarkan Tab Aktif */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-display text-2xl font-bold shadow-md">
                  {formData.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">{formData.fullName}</h3>
                  <p className="text-xs text-muted">Role: {user.role} &bull; Paket {user.plan}</p>
                  <button type="button" className="mt-1.5 text-xs text-primary font-semibold hover:underline cursor-pointer">
                    Ubah Foto Profil
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Nama Panggilan / Nickname</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-indigo-50 p-3 text-xs text-primary flex items-center gap-2">
                <ShieldCheck size={18} />
                <span>Gunakan kombinasi minimal 8 karakter dengan huruf dan angka untuk keamanan optimal.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Password Lama</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <p className="text-xs text-muted">Tentukan jenis notifikasi instan yang ingin Anda terima via nomor WhatsApp terdaftar.</p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-xs text-ink cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={formData.notifyRsvpWa}
                    onChange={(e) => setFormData({ ...formData, notifyRsvpWa: e.target.checked })}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <strong className="block font-bold">Notifikasi Konfirmasi Kehadiran</strong>
                    <span className="text-muted text-[11px]">Kirim pesan WhatsApp setiap kali ada tamu yang mengonfirmasi kehadiran.</span>
                  </div>

                </label>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-xs text-ink cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={formData.notifyBuwuhWa}
                    onChange={(e) => setFormData({ ...formData, notifyBuwuhWa: e.target.checked })}
                    className="mt-0.5 accent-indigo-600 rounded"
                  />
                  <div>
                    <strong className="block font-bold">Notifikasi Buwuh & Amplop Masuk</strong>
                    <span className="text-muted text-[11px]">Kirim pesan saat ada transaksi pemberian hadiah/buwuh digital yang berhasil.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                <Check size={16} /> Pengaturan berhasil disimpan!
              </span>
            ) : (
              <span />
            )}
            <Button type="submit" variant="primary" size="md">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}