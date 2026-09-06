import { useState, useDeferredValue } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  ExternalLink,
  Eye,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  Download,
} from 'lucide-react'
import { useAdminInvitations, useUpdateInvitationStatus } from '@/hooks/useAdmin'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QueryState } from '@/components/common/QueryState'
import { AdminInvitationDetailModal } from '@/components/admin/AdminInvitationDetailModal'
import { formatDateId } from '@/lib/format'
import { parseApiError } from '@/lib/errorHandler'
import { exportAdminInvitationsData } from '@/lib/export'
import type {
  AdminInvitation,
  InvitationStatus,
  EventCategory,
  PlanTier,
} from '@/types/admin'

export default function AdminInvitationsPage() {
  // State filter & pencarian
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'ALL'>('ALL')

  // Fetching data
  const { data, isLoading, isError } = useAdminInvitations({
    page,
    limit: 10,
    search: deferredSearch,
    status: statusFilter,
    eventCategory: categoryFilter,
  })

  // Mutasi status moderasi
  const updateStatusMutation = useUpdateInvitationStatus()

  // State Modal Moderasi
  const [moderationModalInv, setModerationModalInv] = useState<AdminInvitation | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<InvitationStatus>('ACTIVE')

  // ID undangan yang detail kontennya sedang diperiksa (GET /admin/invitations/:id)
  const [detailInvId, setDetailInvId] = useState<string | null>(null)

  // State Notifikasi Feedback
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
  function openModerationModal(inv: AdminInvitation) {
    setModerationModalInv(inv)
    setSelectedStatus(inv.status)
  }

  async function handleConfirmStatusChange() {
    if (!moderationModalInv) return

    try {
      await updateStatusMutation.mutateAsync({
        invitationId: moderationModalInv.id,
        status: selectedStatus,
      })
      setModerationModalInv(null)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Status Moderasi Diperbarui',
        message: `Undangan "${moderationModalInv.title}" berhasil diubah menjadi status ${selectedStatus}.`,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Memperbarui Status',
        message: parsed.generalMessage || 'Terjadi kesalahan saat memoderasi status undangan.',
      })
    }
  }

  const renderStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Aktif (Live)</Badge>
      case 'DRAFT':
        return <Badge variant="default">Draft (Takedown)</Badge>
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

  const renderTierBadge = (tier?: PlanTier) => {
    if (!tier) return null
    switch (tier) {
      case 'MAX':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            MAX
          </span>
        )
      case 'PRO':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            PRO
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            FREE
          </span>
        )
    }
  }

  const invitations = data?.invitations || []
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }

  async function handleExportInvitations() {
    const fallbackRows = invitations.map((inv) => ({
      ID: inv.id,
      Judul: inv.title,
      Slug: inv.slug,
      Kategori: inv.eventCategory,
      Status: inv.status,
      'Pemilik (Email)': inv.owner?.email || '',
      'Paket': inv.owner?.planTier || 'FREE',
      'Dibuat Pada': formatDateId(inv.createdAt),
    }))
    try {
      await exportAdminInvitationsData('xlsx', fallbackRows)
    } catch {
      alert('Gagal mengekspor data undangan')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-slate-800" />
            Moderasi Undangan Global
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau seluruh undangan yang beredar di platform, periksa kepatuhan konten, dan kelola status publikasi.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download size={15} />}
          onClick={handleExportInvitations}
          disabled={invitations.length === 0}
        >
          Ekspor XLSX / CSV
        </Button>
      </div>

      {/* Main Table Card */}
      <TableCard
        title={`Daftar Undangan Seluruh Platform (${pagination.total})`}
        toolbar={
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                value={searchInput}
                onChange={(val) => {
                  setSearchInput(val)
                  setPage(1)
                }}
                placeholder="Cari judul, slug, pemilik, atau email..."
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as InvitationStatus | 'ALL')
                  setPage(1)
                }}
                aria-label="Filter status publikasi undangan"
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif (Live)</option>
                <option value="DRAFT">Draft (Takedown)</option>
                <option value="COMPLETED">Selesai</option>
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as EventCategory | 'ALL')
                  setPage(1)
                }}
                aria-label="Filter kategori acara undangan"
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="WEDDING">Pernikahan</option>
                <option value="KHITANAN">Khitanan</option>
                <option value="RASULAN">Rasulan</option>
                <option value="AQIQAH">Aqiqah</option>
              </select>
            </div>
          </div>
        }
        footerLeft={
          <p className="text-xs text-slate-500">
            Menampilkan {invitations.length} dari {pagination.total} undangan
          </p>
        }
        footerRight={
          pagination.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )
        }
      >
        <QueryState isLoading={isLoading} isError={isError}>
          {invitations.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Tidak Ada Undangan Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian atau sesuaikan filter status dan kategori acara.
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Undangan & URL</th>
                  <th className="py-3.5 px-4">Pemilik Akun</th>
                  <th className="py-3.5 px-4">Kategori & Tema</th>
                  <th className="py-3.5 px-4">Tanggal Acara</th>
                  <th className="py-3.5 px-4 text-center">Tamu & RSVP</th>
                  <th className="py-3.5 px-4">Status Moderasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Judul & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.title}</div>
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-400 mt-0.5">
                        <span>/{inv.slug}</span>
                      </div>
                    </td>

                    {/* Pemilik */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/users/${inv.owner.id}`}
                        className="group inline-flex flex-col"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {inv.owner.fullName}
                          </span>
                          {renderTierBadge(inv.owner.planTier)}
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                          {inv.owner.email}
                        </span>
                      </Link>
                    </td>

                    {/* Kategori & Template */}
                    <td className="py-3.5 px-4">
                      <div>{renderCategoryBadge(inv.eventCategory)}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Template: <span className="font-medium text-slate-700">{inv.template?.name || 'Kustom'}</span>
                      </div>
                    </td>

                    {/* Tanggal Acara */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-800 font-medium">
                        {formatDateId(inv.eventDate)}
                      </div>
                      {inv.venue && (
                        <div className="text-slate-400 truncate max-w-[140px] mt-0.5">
                          {inv.venue}
                        </div>
                      )}
                    </td>

                    {/* Tamu & RSVP */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          {inv.stats.totalGuests} Tamu
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {inv.stats.totalRsvps} RSVP
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(inv.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailInvId(inv.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Periksa isi konten undangan tanpa membuka halaman publik"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                        <a
                          href={`/undangan/${inv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Buka pratinjau publik undangan"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Lihat
                        </a>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModerationModal(inv)}
                          className="inline-flex items-center gap-1 text-xs"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </QueryState>
      </TableCard>

      {/* ========================================================================= */}
      {/* MODAL DETAIL & PEMERIKSAAN KONTEN UNDANGAN */}
      {/* ========================================================================= */}
      {detailInvId && (
        <AdminInvitationDetailModal
          invitationId={detailInvId}
          onClose={() => setDetailInvId(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL MODERASI STATUS UNDANGAN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(moderationModalInv)}
        onClose={() => setModerationModalInv(null)}
        title="Moderasi Status Undangan"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Perbarui status publikasi untuk undangan{' '}
            <strong className="text-slate-900">"{moderationModalInv?.title}"</strong> milik{' '}
            <strong className="text-slate-900">{moderationModalInv?.owner.fullName}</strong>.
          </p>

          {/* Opsi Status */}
          <div className="space-y-2">
            {[
              {
                value: 'ACTIVE' as InvitationStatus,
                label: 'ACTIVE (Publikasikan / Live)',
                desc: 'Undangan dapat diakses secara publik oleh para tamu melalui tautan URL resmi.',
                badge: <Badge variant="success">Aktif</Badge>,
              },
              {
                value: 'DRAFT' as InvitationStatus,
                label: 'DRAFT (Takedown / Simpan)',
                desc: 'Tautan publik dinonaktifkan. Pengguna hanya dapat mengedit tanpa bisa dilihat publik.',
                badge: <Badge variant="default">Draft</Badge>,
              },
              {
                value: 'COMPLETED' as InvitationStatus,
                label: 'COMPLETED (Acara Selesai)',
                desc: 'Acara telah selesai. Undangan diarsipkan dengan mode read-only.',
                badge: <Badge variant="primary">Selesai</Badge>,
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === option.value
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="inv-status-radio"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={() => setSelectedStatus(option.value)}
                    className="w-4 h-4 mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{option.label}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                  </div>
                </div>
                {option.badge}
              </label>
            ))}
          </div>

          {selectedStatus === 'DRAFT' && moderationModalInv?.status === 'ACTIVE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian Takedown:</p>
                <p className="mt-0.5">
                  Mengubah status menjadi <strong>DRAFT</strong> akan langsung membuat tautan publik tidak dapat diakses oleh tamu undangan yang sudah menerima link.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModerationModalInv(null)}
              disabled={updateStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmStatusChange}
              disabled={updateStatusMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Status'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL FEEDBACK (SUCCESS / ERROR) */}
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
