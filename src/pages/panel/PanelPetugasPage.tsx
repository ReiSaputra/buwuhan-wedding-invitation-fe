import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import {
  useStaffs,
  useAddStaff,
  useUpdateStaff,
  useDeleteStaff,
} from '@/hooks/useStaffs'
import type {
  StaffMember,
  StaffRole,
  StaffPermission,
  CreateStaffPayload,
} from '@/types/staff'
import {
  Users,
  UserPlus,
  QrCode,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Trash2,
  Edit2,
  Copy,
  Check,
  Search,
  CheckCircle2,
  Clock,
  Send,
  X,
  Loader2,
} from 'lucide-react'

const ROLE_LABELS: Record<StaffRole, { label: string; desc: string; icon: typeof Users; color: string }> = {
  SCANNER: {
    label: 'Petugas Scan QR',
    desc: 'Memindai barcode/QR tiket tamu di pintu masuk & check-in instan',
    icon: QrCode,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  RECEPTIONIST: {
    label: 'Penerima Tamu (Buku Tamu)',
    desc: 'Mencari tamu manual, cek kehadiran, dan catat status souvenir',
    icon: BookOpen,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CASHIER: {
    label: 'Pencatat Buwuhan & Kasir',
    desc: 'Mencatat amplop uang/barang dan cetak tanda terima buwuh',
    icon: DollarSign,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  COORDINATOR: {
    label: 'Koordinator Acara',
    desc: 'Akses penuh ke monitoring tamu, RSVP, dan rekap real-time',
    icon: ShieldCheck,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  ADMIN: {
    label: 'Admin Undangan',
    desc: 'Akses penuh ke seluruh pengaturan undangan',
    icon: ShieldCheck,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

const PERMISSION_OPTIONS: Array<{ key: StaffPermission; label: string; desc: string }> = [
  { key: 'SCAN_QR', label: 'Scan QR Tiket Tamu', desc: 'Dapat memindai QR code tamu di meja resepsi' },
  { key: 'MANAGE_GUESTS', label: 'Kelola Buku Tamu', desc: 'Mencari dan mengubah status kehadiran tamu' },
  { key: 'RECORD_BUWUH', label: 'Catat Buwuh & Hadiah', desc: 'Input sumbangan uang, beras, atau kado fisik' },
  { key: 'VIEW_STATS', label: 'Lihat Statistik & Laporan', desc: 'Melihat ringkasan total tamu dan perolehan buwuh' },
  { key: 'MANAGE_SETTINGS', label: 'Ubah Pengaturan Acara', desc: 'Mengedit detail acara dan template' },
]

/**
 * Halaman Manajemen Petugas & Hak Akses Undangan (PanelPetugasPage).
 * Memungkinkan pemilik undangan menugaskan panitia/petugas meja tamu,
 * scanner QR, dan pencatat buwuhan dengan hak akses terbatas.
 */
export default function PanelPetugasPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { data: staffs = [] } = useStaffs(id)
  const { mutateAsync: addStaff, isPending: isAdding } = useAddStaff(id)
  const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff(id)
  const { mutateAsync: deleteStaff } = useDeleteStaff(id)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<StaffRole>('SCANNER')
  const [permissions, setPermissions] = useState<StaffPermission[]>(['SCAN_QR'])

  function openAddModal() {
    setEditingStaff(null)
    setName('')
    setEmail('')
    setPhone('')
    setRole('SCANNER')
    setPermissions(['SCAN_QR'])
    setModalError(null)
    setIsModalOpen(true)
  }

  function openEditModal(staff: StaffMember) {
    setEditingStaff(staff)
    setName(staff.name)
    setEmail(staff.email)
    setPhone(staff.phone || '')
    setRole(staff.role)
    setPermissions(staff.permissions)
    setModalError(null)
    setIsModalOpen(true)
  }

  function handleRoleChange(newRole: StaffRole) {
    setRole(newRole)
    if (newRole === 'SCANNER') setPermissions(['SCAN_QR'])
    else if (newRole === 'RECEPTIONIST') setPermissions(['SCAN_QR', 'MANAGE_GUESTS'])
    else if (newRole === 'CASHIER') setPermissions(['RECORD_BUWUH', 'VIEW_STATS'])
    else if (newRole === 'COORDINATOR') setPermissions(['SCAN_QR', 'MANAGE_GUESTS', 'RECORD_BUWUH', 'VIEW_STATS'])
    else if (newRole === 'ADMIN') setPermissions(['SCAN_QR', 'MANAGE_GUESTS', 'RECORD_BUWUH', 'VIEW_STATS', 'MANAGE_SETTINGS'])
  }

  function togglePermission(perm: StaffPermission) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    )
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setModalError(null)

    if (!name.trim()) {
      setModalError('Nama petugas wajib diisi')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setModalError('Masukkan alamat email petugas yang valid')
      return
    }

    try {
      if (editingStaff) {
        await updateStaff({
          id: editingStaff.id,
          payload: {
            name: name.trim(),
            phone: phone.trim() || undefined,
            role,
            permissions,
          },
        })
      } else {
        const payload: CreateStaffPayload = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          permissions,
        }
        await addStaff(payload)
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      setModalError((err as Error)?.message || 'Gagal menyimpan data petugas')
    }
  }

  async function handleDelete(staffId: string, staffName: string) {
    if (!window.confirm(`Yakin ingin mencabut akses untuk ${staffName}?`)) return
    try {
      await deleteStaff(staffId)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal menghapus petugas')
    }
  }

  function copyInviteLink(staff: StaffMember) {
    const inviteUrl = `${window.location.origin}/staff/join?token=${staff.inviteToken || staff.id}&invitationId=${id}`
    void navigator.clipboard.writeText(inviteUrl)
    setCopiedId(staff.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  function shareViaWhatsApp(staff: StaffMember) {
    const inviteUrl = `${window.location.origin}/staff/join?token=${staff.inviteToken || staff.id}&invitationId=${id}`
    const text = encodeURIComponent(
      `Halo ${staff.name},\n\nAnda telah ditugaskan sebagai *${ROLE_LABELS[staff.role]?.label}* untuk acara pernikahan *${invitation.coupleName}*.\n\nSilakan klik tautan berikut untuk membuka panel petugas:\n${inviteUrl}\n\nTerima kasih!`,
    )
    window.open(`https://wa.me/${staff.phone?.replace(/[^0-9]/g, '') || ''}?text=${text}`, '_blank')
  }

  const filteredStaffs = staffs.filter((s) => {
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery))
    const matchRole = roleFilter === 'ALL' || s.role === roleFilter
    return matchQuery && matchRole
  })

  const totalScanners = staffs.filter((s) => s.role === 'SCANNER' || s.role === 'RECEPTIONIST').length
  const totalCashiers = staffs.filter((s) => s.role === 'CASHIER').length
  const totalActive = staffs.filter((s) => s.status === 'ACTIVE').length

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: 'Petugas & Panitia' },
        ]}
      />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <Users className="text-primary" />
            <span>Petugas & Hak Akses Panitia</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Tugaskan panitia resepsi (Scanner QR, Penerima Tamu, dan Kasir Buwuh) dengan akses terbatas untuk acara {invitation.coupleName}.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openAddModal}
          icon={<UserPlus size={16} />}
        >
          Tambah Petugas
        </Button>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Petugas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">{staffs.length} Orang</strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Petugas Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-emerald-600">{totalActive} Orang</strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Meja Tamu / QR</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <QrCode size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">{totalScanners} Orang</strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kasir / Buwuhan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <DollarSign size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">{totalCashiers} Orang</strong>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau no. HP..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                roleFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({staffs.length})
            </button>
            {(['SCANNER', 'RECEPTIONIST', 'CASHIER', 'COORDINATOR'] as StaffRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                  roleFilter === r
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ROLE_LABELS[r]?.label.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel / Kartu Petugas */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Petugas</th>
                <th className="px-4 py-3.5">Peran & Tanggung Jawab</th>
                <th className="px-4 py-3.5">Izin Akses</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted text-xs">
                    Belum ada petugas yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredStaffs.map((staff) => {
                  const roleConfig = ROLE_LABELS[staff.role] || ROLE_LABELS.SCANNER
                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-ink">{staff.name}</div>
                        <div className="text-xs text-muted">{staff.email}</div>
                        {staff.phone && <div className="text-[11px] text-slate-400">WA: {staff.phone}</div>}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${roleConfig.color}`}>
                          <roleConfig.icon size={13} />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {staff.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                            >
                              {PERMISSION_OPTIONS.find((p) => p.key === perm)?.label || perm}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {staff.status === 'ACTIVE' ? (
                          <Badge variant="primary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 size={11} className="mr-1 inline" /> Aktif
                          </Badge>
                        ) : staff.status === 'PENDING' ? (
                          <Badge variant="default" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock size={11} className="mr-1 inline" /> Menunggu Buka Tautan
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-slate-100 text-slate-500">
                            Dicabut
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyInviteLink(staff)}
                            title="Salin Link Undangan Petugas"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ink transition cursor-pointer"
                          >
                            {copiedId === staff.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>

                          {staff.phone && (
                            <button
                              type="button"
                              onClick={() => shareViaWhatsApp(staff)}
                              title="Kirim via WhatsApp"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                            >
                              <Send size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            title="Edit Izin"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ink transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(staff.id, staff.name)}
                            title="Cabut Akses"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT PETUGAS */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Users size={18} className="text-primary" />
                <span>{editingStaff ? 'Ubah Hak Akses Petugas' : 'Tambah Petugas Baru'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {modalError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Nama Petugas</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled={Boolean(editingStaff)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmad@example.com"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Pilih Peran Utama</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['SCANNER', 'RECEPTIONIST', 'CASHIER', 'COORDINATOR'] as StaffRole[]).map((r) => {
                    const cfg = ROLE_LABELS[r]
                    const isSelected = role === r
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-indigo-50/50 ring-1 ring-primary'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
                          <cfg.icon size={14} className={isSelected ? 'text-primary' : 'text-slate-500'} />
                          <span>{cfg.label.split(' (')[0]}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted line-clamp-2">{cfg.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-2">Hak Akses Granular</label>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  {PERMISSION_OPTIONS.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-2.5 text-xs text-ink cursor-pointer hover:bg-white p-1.5 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 accent-indigo-600 rounded"
                      />
                      <div>
                        <strong className="block font-bold">{perm.label}</strong>
                        <span className="text-muted text-[11px]">{perm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Menyimpan...
                    </span>
                  ) : editingStaff ? (
                    'Simpan Perubahan'
                  ) : (
                    'Tambah Petugas'
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
