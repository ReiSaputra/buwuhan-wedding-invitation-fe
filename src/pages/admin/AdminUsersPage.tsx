import { useState, useDeferredValue } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Shield,
  CreditCard,
  LogOut,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import {
  useAdminUsers,
  useUpdateUserTier,
  useUpdateUserRole,
  useRevokeUserSessions,
  useDeleteUser,
} from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QueryState } from '@/components/common/QueryState'
import { formatDateId, getInitial } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import type { AdminUser, PlanTier, UserRole } from '@/types/admin'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()

  // State filter & pencarian
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [tierFilter, setTierFilter] = useState<PlanTier | 'ALL'>('ALL')

  // Data fetching
  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: 10,
    search: deferredSearch,
    role: roleFilter,
    planTier: tierFilter,
  })

  // Mutasi
  const updateTierMutation = useUpdateUserTier()
  const updateRoleMutation = useUpdateUserRole()
  const revokeSessionsMutation = useRevokeUserSessions()
  const deleteUserMutation = useDeleteUser()

  // State Modal Aksi
  const [tierModalUser, setTierModalUser] = useState<AdminUser | null>(null)
  const [selectedTier, setSelectedTier] = useState<PlanTier>('FREE')

  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER')

  const [revokeUser, setRevokeUser] = useState<AdminUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)

  // State notifikasi feedback (Success/Error)
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

  // Handlers mutasi
  async function handleConfirmTier() {
    if (!tierModalUser) return
    try {
      await updateTierMutation.mutateAsync({
        userId: tierModalUser.id,
        planTier: selectedTier,
      })
      setTierModalUser(null)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Paket Tier Diperbarui',
        message: `Paket untuk ${tierModalUser.fullName} berhasil diubah menjadi ${selectedTier}.`,
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
    if (!roleModalUser) return
    if (roleModalUser.id === currentUser?.id && selectedRole !== 'ADMIN') {
      alert('Anda dilarang mencabut hak akses ADMIN dari akun Anda sendiri demi keamanan.')
      return
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: roleModalUser.id,
        role: selectedRole,
      })
      setRoleModalUser(null)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Peran Akun Diperbarui',
        message: `Role untuk ${roleModalUser.fullName} berhasil diubah menjadi ${selectedRole}.`,
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
    if (!revokeUser) return
    try {
      const res = await revokeSessionsMutation.mutateAsync(revokeUser.id)
      setRevokeUser(null)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Sesi Login Berhasil Dicabut',
        message: `Sebanyak ${res.revokedCount} sesi aktif milik ${revokeUser.fullName} telah diputus paksa.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Memutus Sesi',
        message: parsed.generalMessage || 'Gagal mencabut sesi aktif pengguna.',
      })
    }
  }

  async function handleConfirmDelete() {
    if (!deleteUser) return
    if (deleteUser.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.')
      return
    }

    try {
      await deleteUserMutation.mutateAsync(deleteUser.id)
      setDeleteUser(null)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Pengguna Dihapus Permanen',
        message: `Akun ${deleteUser.fullName} (${deleteUser.email}) beserta seluruh data miliknya telah dihapus.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Pengguna',
        message: parsed.generalMessage || 'Terjadi kesalahan saat menghapus pengguna.',
      })
    }
  }

  const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
  const tdClass = 'px-6 py-4 align-middle text-xs'

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Manajemen Pengguna
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Kelola hak akses pengguna, paket langganan, sesi login, dan tindakan administratif platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <QueryState isLoading={isLoading} isError={isError}>
        <TableCard
          title={`Daftar Pengguna Platform (${data?.pagination.total ?? 0})`}
          toolbar={
            <div className="flex flex-wrap items-center gap-2.5">
              <SearchInput
                placeholder="Cari nama atau email..."
                value={searchInput}
                onChange={(val) => {
                  setSearchInput(val)
                  setPage(1)
                }}
                className="w-full sm:w-64"
              />

              {/* Filter Role */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole | 'ALL')
                  setPage(1)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="ALL">Semua Peran</option>
                <option value="USER">User Reguler</option>
                <option value="ADMIN">Superadmin</option>
              </select>

              {/* Filter Tier */}
              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value as PlanTier | 'ALL')
                  setPage(1)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="ALL">Semua Paket</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="MAX">Max</option>
              </select>
            </div>
          }
          footerLeft={
            data && (
              <span className="text-xs text-muted">
                Menampilkan halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} pengguna)
              </span>
            )
          }
          footerRight={
            data && data.pagination.totalPages > 1 ? (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            ) : null
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <th className={thClass}>Profil Pengguna</th>
                  <th className={thClass}>Peran (Role)</th>
                  <th className={thClass}>Paket Langganan</th>
                  <th className={thClass}>Total Undangan</th>
                  <th className={thClass}>Terdaftar Sejak</th>
                  <th className={`${thClass} text-right`}>Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted">
                      <div className="mx-auto max-w-xs space-y-2">
                        <Users size={28} className="mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-600">Tidak ada pengguna yang cocok</p>
                        <p className="text-[11px] text-slate-400">
                          Sesuaikan kata kunci pencarian atau filter peran dan paket.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {data?.users.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-primary border border-indigo-100 text-xs">
                            {getInitial(user.fullName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-ink">{user.fullName}</span>
                              {isSelf && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className={tdClass}>
                        <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>

                      <td className={tdClass}>
                        <Badge
                          variant={
                            user.planTier === 'MAX'
                              ? 'primary'
                              : user.planTier === 'PRO'
                              ? 'success'
                              : 'outline'
                          }
                        >
                          {user.planTier}
                        </Badge>
                      </td>

                      <td className={tdClass}>
                        <span className="font-semibold text-slate-700">
                          {user.totalInvitations} Undangan
                        </span>
                      </td>

                      <td className={tdClass}>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {formatDateId(user.createdAt)}
                        </span>
                      </td>

                      <td className={`${tdClass} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail & Audit */}
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="rounded-xl p-2 text-slate-400 hover:bg-indigo-50 hover:text-primary transition cursor-pointer"
                            title="Lihat Rincian & Audit Undangan"
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Ubah Tier */}
                          <button
                            type="button"
                            onClick={() => {
                              setTierModalUser(user)
                              setSelectedTier(user.planTier)
                            }}
                            className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition cursor-pointer"
                            title="Ubah Paket Langganan"
                          >
                            <CreditCard size={15} />
                          </button>

                          {/* Ubah Role */}
                          <button
                            type="button"
                            onClick={() => {
                              setRoleModalUser(user)
                              setSelectedRole(user.role)
                            }}
                            className="rounded-xl p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition cursor-pointer"
                            title="Ubah Role (Promosi/Demosi)"
                          >
                            <Shield size={15} />
                          </button>

                          {/* Putus Sesi */}
                          <button
                            type="button"
                            onClick={() => setRevokeUser(user)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                            title="Putus Seluruh Sesi Login Aktif"
                          >
                            <LogOut size={15} />
                          </button>

                          {/* Hapus Pengguna */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setDeleteUser(user)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-danger disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title={isSelf ? 'Anda tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna Permanen'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </TableCard>
      </QueryState>

      {/* Modal Ubah Plan Tier */}
      <Modal
        isOpen={tierModalUser !== null}
        onClose={() => setTierModalUser(null)}
        title="Ubah Paket Langganan Pengguna"
        description={`Pilih tingkatan paket (tier) baru untuk akun "${tierModalUser?.fullName}".`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {(['FREE', 'PRO', 'MAX'] as PlanTier[]).map((tier) => (
              <label
                key={tier}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedTier === tier
                    ? 'border-primary bg-indigo-50/60 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="planTier"
                    value={tier}
                    checked={selectedTier === tier}
                    onChange={() => setSelectedTier(tier)}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-bold text-xs text-ink">{tier}</span>
                    <p className="text-[11px] text-muted">
                      {tier === 'FREE' && 'Akses fitur standar dengan batas tamu terbatas'}
                      {tier === 'PRO' && 'Akses template premium & buku tamu lengkap'}
                      {tier === 'MAX' && 'Fitur terlengkap, scan QR tanpa batas, & prioritas'}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setTierModalUser(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmTier}
              disabled={updateTierMutation.isPending}
            >
              {updateTierMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Ubah Role Pengguna */}
      <Modal
        isOpen={roleModalUser !== null}
        onClose={() => setRoleModalUser(null)}
        title="Ubah Peran Hak Akses Pengguna"
        description={`Konfigurasi role sistem untuk "${roleModalUser?.fullName}".`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          {roleModalUser?.id === currentUser?.id && (
            <div className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Ini adalah akun Anda sendiri. Mencabut status ADMIN dilarang oleh sistem agar tidak terkunci keluar.
              </span>
            </div>
          )}

          <div className="space-y-2">
            {(['USER', 'ADMIN'] as UserRole[]).map((r) => (
              <label
                key={r}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedRole === r
                    ? 'border-primary bg-indigo-50/60 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={selectedRole === r}
                    onChange={() => setSelectedRole(r)}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-bold text-xs text-ink">
                      {r === 'ADMIN' ? 'SUPERADMIN' : 'REGULAR USER'}
                    </span>
                    <p className="text-[11px] text-muted">
                      {r === 'ADMIN'
                        ? 'Memiliki akses penuh mengelola pengguna, undangan global, dan template'
                        : 'Hanya dapat mengelola undangan dan dashboard miliknya sendiri'}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRoleModalUser(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Menyimpan...' : 'Perbarui Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Putus Sesi (Revoke) */}
      <Modal
        isOpen={revokeUser !== null}
        onClose={() => setRevokeUser(null)}
        title="Putus Seluruh Sesi Login?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin mencabut seluruh sesi login aktif milik <strong>"{revokeUser?.fullName}"</strong>? Pengguna akan langsung ter-logout dari semua perangkat dan browser.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRevokeUser(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRevoke}
              disabled={revokeSessionsMutation.isPending}
            >
              {revokeSessionsMutation.isPending ? 'Memproses...' : 'Ya, Putus Sesi'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Pengguna (Destructive) */}
      <Modal
        isOpen={deleteUser !== null}
        onClose={() => setDeleteUser(null)}
        title="Hapus Pengguna Secara Permanen?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-50 p-3 text-xs text-danger border border-red-100 flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>
              Tindakan ini bersifat destruktif dan tidak dapat dibatalkan. Seluruh undangan, buku tamu, RSVP, dan riwayat milik akun ini akan terhapus permanen dari basis data.
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ketik konfirmasi penghapusan akun <strong>"{deleteUser?.fullName}"</strong> ({deleteUser?.email}):
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteUser(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Notifikasi Hasil Aksi */}
      <Modal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
        maxWidth="sm"
      >
        <div className="py-2 text-center space-y-3">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-red-50 text-danger border border-red-100'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink">{feedback.title}</h3>
            <p className="mt-1 text-xs text-muted">{feedback.message}</p>
          </div>
          <div className="pt-2">
            <Button
              variant={feedback.type === 'success' ? 'primary' : 'outline'}
              size="sm"
              className="w-full"
              onClick={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
