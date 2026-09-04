import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  CreditCard,
  LogOut,
  Trash2,
  ExternalLink,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building,
  Clock,
} from 'lucide-react'
import {
  useAdminUserDetail,
  useUpdateUserTier,
  useUpdateUserRole,
  useRevokeUserSessions,
  useDeleteUser,
} from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { TableCard } from '@/components/ui/TableCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QueryState } from '@/components/common/QueryState'
import { formatDateId, getInitial } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import type { PlanTier, UserRole, InvitationStatus, EventCategory } from '@/types/admin'

export default function AdminUserDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  // Fetch detail
  const { data: userDetail, isLoading, isError } = useAdminUserDetail(id)

  // Mutasi
  const updateTierMutation = useUpdateUserTier()
  const updateRoleMutation = useUpdateUserRole()
  const revokeSessionsMutation = useRevokeUserSessions()
  const deleteUserMutation = useDeleteUser()

  // Modals state
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PlanTier>('FREE')

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER')

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Feedback notification modal
  const [feedback, setFeedback] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Handlers
  function openTierModal() {
    if (!userDetail) return
    setSelectedTier(userDetail.planTier)
    setIsTierModalOpen(true)
  }

  function openRoleModal() {
    if (!userDetail) return
    setSelectedRole(userDetail.role)
    setIsRoleModalOpen(true)
  }

  async function handleConfirmTier() {
    if (!userDetail) return
    try {
      await updateTierMutation.mutateAsync({
        userId: userDetail.id,
        planTier: selectedTier,
      })
      setIsTierModalOpen(false)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Paket Tier Diperbarui',
        message: `Paket untuk ${userDetail.fullName} berhasil diubah menjadi ${selectedTier}.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mengubah Paket',
        message: parsed.generalMessage || 'Terjadi kesalahan saat memperbarui paket tier.',
      })
    }
  }

  async function handleConfirmRole() {
    if (!userDetail) return
    if (userDetail.id === currentUser?.id && selectedRole !== 'ADMIN') {
      alert('Anda dilarang mencabut hak akses ADMIN dari akun Anda sendiri demi keamanan.')
      return
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: userDetail.id,
        role: selectedRole,
      })
      setIsRoleModalOpen(false)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Peran Akun Diperbarui',
        message: `Role untuk ${userDetail.fullName} berhasil diubah menjadi ${selectedRole}.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mengubah Peran Akun',
        message: parsed.generalMessage || 'Terjadi kesalahan saat memperbarui role pengguna.',
      })
    }
  }

  async function handleConfirmRevoke() {
    if (!userDetail) return
    try {
      const result = await revokeSessionsMutation.mutateAsync(userDetail.id)
      setIsRevokeModalOpen(false)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Sesi Login Dicabut',
        message: `Berhasil mencabut ${result.revokedCount} sesi aktif untuk ${userDetail.fullName}. Pengguna dipaksa login ulang.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mencabut Sesi',
        message: parsed.generalMessage || 'Terjadi kesalahan saat memutus sesi pengguna.',
      })
    }
  }

  async function handleConfirmDelete() {
    if (!userDetail) return
    if (userDetail.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.')
      return
    }

    try {
      await deleteUserMutation.mutateAsync(userDetail.id)
      setIsDeleteModalOpen(false)
      // Navigate back to user list after deletion
      navigate('/admin/users')
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Akun',
        message: parsed.generalMessage || 'Terjadi kesalahan saat menghapus pengguna.',
      })
    }
  }

  const renderTierBadge = (tier: PlanTier) => {
    switch (tier) {
      case 'MAX':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            MAX
          </span>
        )
      case 'PRO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            PRO
          </span>
        )
      case 'FREE':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            FREE
          </span>
        )
    }
  }

  const renderRoleBadge = (role: UserRole) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Shield className="w-3 h-3 text-purple-600" />
          ADMIN
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        USER
      </span>
    )
  }

  const renderStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Aktif (Live)</Badge>
      case 'DRAFT':
        return <Badge variant="default">Draft</Badge>
      case 'COMPLETED':
        return <Badge variant="primary">Selesai</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const renderCategoryBadge = (category: EventCategory) => {
    switch (category) {
      case 'WEDDING':
        return <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">Pernikahan</span>
      case 'KHITANAN':
        return <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Khitanan</span>
      case 'RASULAN':
        return <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">Rasulan</span>
      case 'AQIQAH':
        return <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">Aqiqah</span>
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{category}</span>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pengguna
        </Link>
        <span className="text-xs text-slate-400">ID: {id}</span>
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        {userDetail && (
          <>
            {/* Header Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* User Info Left */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    {getInitial(userDetail.fullName)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {userDetail.fullName}
                      </h1>
                      {renderRoleBadge(userDetail.role)}
                      {renderTierBadge(userDetail.planTier)}
                      {userDetail.id === currentUser?.id && (
                        <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full font-medium">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {userDetail.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Terdaftar sejak {formatDateId(userDetail.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons Right */}
                <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openTierModal}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    Ubah Tier
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openRoleModal}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    Ubah Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRevokeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-600" />
                    Putus Sesi
                  </Button>
                  {userDetail.id !== currentUser?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Hapus Akun
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Undangan</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {userDetail.stats.totalInvitations}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Tamu Diundang</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {userDetail.stats.totalGuests}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Paket Langganan</p>
                  <div className="mt-1">{renderTierBadge(userDetail.planTier)}</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Hak Akses / Role</p>
                  <div className="mt-1">{renderRoleBadge(userDetail.role)}</div>
                </div>
              </div>
            </div>

            {/* Owned Invitations Audit Table */}
            <TableCard
              title={`Undangan yang Dimiliki (${userDetail.invitations.length})`}
            >
              {userDetail.invitations.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">Pengguna belum membuat undangan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Saat pengguna membuat undangan, daftar dan metriknya akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Judul Undangan & Slug</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Tanggal & Jam Acara</th>
                        <th className="py-3 px-4">Lokasi Acara</th>
                        <th className="py-3 px-4 text-center">Total Tamu</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userDetail.invitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{inv.title}</div>
                            <div className="text-xs font-mono text-slate-400 mt-0.5">
                              /{inv.slug}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {renderCategoryBadge(inv.eventCategory)}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <div className="text-slate-800 font-medium">
                              {formatDateId(inv.eventDate)}
                            </div>
                            {inv.eventTime && (
                              <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {inv.eventTime}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs max-w-xs truncate">
                            {inv.venue ? (
                              <span className="flex items-center gap-1 text-slate-700">
                                <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{inv.venue}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Belum diisi</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              <Users className="w-3 h-3 text-slate-400" />
                              {inv.totalGuests}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {renderStatusBadge(inv.status)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`/undangan/${inv.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Buka pratinjau publik undangan"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Preview Publik
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TableCard>
          </>
        )}
      </QueryState>

      {/* ========================================================================= */}
      {/* MODAL 1: UBAH PLAN TIER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        title="Ubah Paket Langganan (Tier)"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Perbarui tier akun <strong className="text-slate-900">{userDetail?.fullName}</strong>.
            Perubahan tier akan langsung memengaruhi batas kuota tamu, akses fitur, dan tema premium.
          </p>

          <div className="space-y-2">
            {(['FREE', 'PRO', 'MAX'] as PlanTier[]).map((tierOption) => (
              <label
                key={tierOption}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTier === tierOption
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="user-detail-tier"
                    value={tierOption}
                    checked={selectedTier === tierOption}
                    onChange={() => setSelectedTier(tierOption)}
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{tierOption}</span>
                    <p className="text-xs text-slate-500">
                      {tierOption === 'FREE' && 'Fitur dasar undangan, tema standar'}
                      {tierOption === 'PRO' && 'Kustomisasi warna, RSVP instan, galeri foto lengkap'}
                      {tierOption === 'MAX' && 'Seluruh fitur tanpa batas, prioritas server, tema eksklusif'}
                    </p>
                  </div>
                </div>
                {renderTierBadge(tierOption)}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTierModalOpen(false)}
              disabled={updateTierMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmTier}
              disabled={updateTierMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {updateTierMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: UBAH ROLE (PROMOSI / DEMOSI) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Ubah Peran Akun (Role)"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Peringatan Keamanan:</p>
              <p className="mt-0.5">
                Pengguna dengan role <strong>ADMIN</strong> memiliki akses penuh ke seluruh data platform,
                audit pengguna, moderasi undangan, dan pengaturan server.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(['USER', 'ADMIN'] as UserRole[]).map((roleOption) => (
              <label
                key={roleOption}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === roleOption
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="user-detail-role"
                    value={roleOption}
                    checked={selectedRole === roleOption}
                    onChange={() => setSelectedRole(roleOption)}
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{roleOption}</span>
                    <p className="text-xs text-slate-500">
                      {roleOption === 'USER' && 'Pengguna biasa, hanya dapat mengelola undangan miliknya'}
                      {roleOption === 'ADMIN' && 'Superadmin dengan hak akses penuh ke Admin Portal'}
                    </p>
                  </div>
                </div>
                {renderRoleBadge(roleOption)}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoleModalOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRole}
              disabled={updateRoleMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Terapkan Peran'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: PUTUS SESI LOGIN (REVOKE) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Putus Semua Sesi Login"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin memutuskan seluruh sesi login aktif untuk pengguna{' '}
            <strong className="text-slate-900">{userDetail?.fullName}</strong>?
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            Tindakan ini akan membatalkan seluruh token JWT aktif di semua perangkat/browser milik pengguna. Pengguna wajib melakukan login ulang.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRevokeModalOpen(false)}
              disabled={revokeSessionsMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRevoke}
              disabled={revokeSessionsMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {revokeSessionsMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Memutus Sesi...
                </>
              ) : (
                'Ya, Putus Seluruh Sesi'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: HAPUS PENGGUNA (CASCADE DELETE) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Akun Pengguna Permanen"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
              <p className="mt-0.5">
                Menghapus akun <strong className="text-rose-950">{userDetail?.fullName}</strong> akan menghapus secara permanen seluruh data undangan ({userDetail?.stats.totalInvitations || 0}), buku tamu ({userDetail?.stats.totalGuests || 0}), RSVP, dan riwayat buwuh miliknya (Cascade Delete).
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Ketik konfirmasi dalam hati dan klik tombol merah di bawah untuk melanjutkan penghapusan permanen.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menghapus Akun...
                </>
              ) : (
                'Hapus Akun Permanen'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL FEEDBACK (SUCCESS / ERROR TOAST REPLACEMENT) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
        title={feedback.title}
      >
        <div className="space-y-4 py-1">
          <div className="flex items-start gap-3">
            {feedback.type === 'success' ? (
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600 mt-1">{feedback.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Mengerti
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
