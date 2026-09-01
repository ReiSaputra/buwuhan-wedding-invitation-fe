import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Search, Plus, AlertTriangle } from 'lucide-react'
import { ViewToggle } from './ViewToggle'
import { InvitationCard } from './InvitationCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { InvitationSummary, ViewMode, InvitationStatus } from '@/types/dashboard'
import { cn } from '@/lib/cn'
import { CreateInvitationModal } from './CreateInvitationModal'
import { useDeleteInvitation } from '@/hooks/useInvitationMutations'
import { parseApiError } from '@/lib/errorHandler'

export type InvitationListProps = {
  /** Judul bagian daftar undangan */
  title: string
  /** Daftar undangan yang akan dirender */
  invitations: InvitationSummary[]
  /** Mode tampilan awal ('list' atau 'grid') */
  defaultView?: ViewMode
  /** Pesan kustom saat tidak ada data undangan */
  emptyMessage?: string
  /** Menampilkan tombol Buat Undangan di samping judul */
  showCreateButton?: boolean
}

type FilterStatus = 'ALL' | InvitationStatus

/**
 * Komponen container daftar undangan dengan dukungan pencarian nama,
 * filter status, pengalihan tampilan Grid/List, serta modal dialog konfirmasi hapus.
 * 
 * @param props - Properti InvitationList
 */
export function InvitationList({
  title,
  invitations,
  defaultView = 'list',
  emptyMessage = 'Belum ada undangan. Buat undangan pertamamu untuk memulai.',
  showCreateButton = true,
}: InvitationListProps) {
  const [view, setView] = useState<ViewMode>(defaultView)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')

  // State untuk Modal Konfirmasi Hapus
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // State untuk Modal Buat Undangan Baru
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const deleteInvitation = useDeleteInvitation()
  const navigate = useNavigate()

  /**
   * Menyaring daftar undangan berdasarkan query pencarian dan status yang dipilih.
   */
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchSearch =
        inv.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.slug.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        selectedStatus === 'ALL' || inv.status === selectedStatus

      return matchSearch && matchStatus
    })
  }, [invitations, searchQuery, selectedStatus])

  /**
   * Membuka modal konfirmasi hapus undangan.
   *
   * @param id - ID undangan yang ingin dihapus
   */
  function handleOpenDeleteModal(id: string) {
    setDeleteError(null)
    setDeleteTargetId(id)
  }

  /**
   * Menghapus undangan di backend setelah dikonfirmasi pengguna.
   * Daftar akan menyusut sendiri karena cache dashboard di-invalidate.
   */
  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setDeleteError(null)

    try {
      await deleteInvitation.mutateAsync(deleteTargetId)
      setDeleteTargetId(null)
    } catch (error) {
      // Tampilkan pesan asli dari backend agar penyebab kegagalan jelas,
      // misalnya sesi kedaluwarsa, undangan sudah terhapus, atau galat relasi.
      const parsed = parseApiError(error)
      setDeleteError(parsed.generalMessage)
    }
  }

  const targetInvitation = invitations.find((i) => i.id === deleteTargetId)

  return (
    <section className="space-y-4">
      {/* Header Baris Judul & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <span>{title}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {filteredInvitations.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {showCreateButton && (
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Buat Undangan
            </Button>
          )}
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-border shadow-2xs">
        {/* Input Pencarian */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama mempelai atau slug..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-2 text-xs text-ink placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Tab Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: 'ALL', label: 'Semua' },
              { key: 'ACTIVE', label: 'Aktif' },
              { key: 'DRAFT', label: 'Draft' },
              { key: 'COMPLETED', label: 'Selesai' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer',
                selectedStatus === tab.key
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Kartu / Baris Undangan */}
      {filteredInvitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
            <Mail size={28} />
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink">Tidak Ada Undangan Ditemukan</h3>
          <p className="mt-1.5 text-xs text-muted max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedStatus !== 'ALL'
              ? 'Tidak ada undangan yang cocok dengan filter atau kata kunci pencarian Anda.'
              : emptyMessage}
          </p>
          {(searchQuery || selectedStatus !== 'ALL') && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setSelectedStatus('ALL')
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-200'
              : 'space-y-3.5 animate-in fade-in duration-200'
          }
        >
          {filteredInvitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              view={view}
              onManage={(id) => navigate(`/dashboard/undangan/${id}`)}
              onDelete={handleOpenDeleteModal}
              onScan={(id) => navigate(`/dashboard/undangan/${id}/scan-qr`)}
            />
          ))}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Undangan */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Hapus Undangan?"
        description="Tindakan ini permanen dan akan menghapus seluruh data tamu, konfirmasi kehadiran, serta buku ucapan terkait."
      >

        <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            Undangan: <strong>{targetInvitation?.coupleName}</strong> ({targetInvitation?.slug})
          </div>
        </div>

        {deleteError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-danger">
            {deleteError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteTargetId(null)}
            disabled={deleteInvitation.isPending}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteInvitation.isPending}
            onClick={handleConfirmDelete}
          >
            Ya, Hapus Sekarang
          </Button>
        </div>
      </Modal>

      {/* Modal Buat Undangan Baru.
          Prop `key` berubah setiap modal dibuka atau ditutup, sehingga React
          memasang ulang modal beserta InvitationForm di dalamnya. Inilah yang
          menggantikan reset formulir lewat useEffect (aturan React Compiler
          melarang setState langsung di dalam effect). */}
      <CreateInvitationModal
        key={isCreateModalOpen ? 'buat-undangan-terbuka' : 'buat-undangan-tertutup'}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  )
}