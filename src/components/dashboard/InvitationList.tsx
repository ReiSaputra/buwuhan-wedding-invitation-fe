import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Search, Plus, AlertTriangle, Sparkles } from 'lucide-react'
import { ViewToggle } from './ViewToggle'
import { InvitationCard } from './InvitationCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { InvitationSummary, ViewMode, InvitationStatus } from '@/types/dashboard'
import { cn } from '@/lib/cn'

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
  invitations: initialInvitations,
  defaultView = 'list',
  emptyMessage = 'Belum ada undangan. Buat undangan pertamamu untuk memulai.',
  showCreateButton = true,
}: InvitationListProps) {
  const [view, setView] = useState<ViewMode>(defaultView)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [invitationsList, setInvitationsList] = useState(initialInvitations)

  // State untuk Modal Konfirmasi Hapus
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State untuk Modal Buat Undangan Baru (Preview/Simulasi)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const navigate = useNavigate()

  /**
   * Menyaring daftar undangan berdasarkan query pencarian dan status yang dipilih.
   */
  const filteredInvitations = useMemo(() => {
    return invitationsList.filter((inv) => {
      const matchSearch =
        inv.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.slug.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        selectedStatus === 'ALL' || inv.status === selectedStatus

      return matchSearch && matchStatus
    })
  }, [invitationsList, searchQuery, selectedStatus])

  /**
   * Membuka modal konfirmasi hapus undangan.
   * 
   * @param id - ID undangan yang ingin dihapus
   */
  function handleOpenDeleteModal(id: string) {
    setDeleteTargetId(id)
  }

  /**
   * Menjalankan aksi penghapusan undangan setelah dikonfirmasi di modal.
   */
  function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)

    setTimeout(() => {
      setInvitationsList((prev) => prev.filter((item) => item.id !== deleteTargetId))
      setIsDeleting(false)
      setDeleteTargetId(null)
    }, 600)
  }

  const targetInvitation = invitationsList.find((i) => i.id === deleteTargetId)

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
              { key: 'PUBLISHED', label: 'Aktif' },
              { key: 'DRAFT', label: 'Draft' },
              { key: 'EXPIRED', label: 'Selesai' },
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
        description="Tindakan ini permanen dan akan menghapus seluruh data tamu, RSVP, serta buku ucapan terkait."
      >
        <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            Undangan: <strong>{targetInvitation?.coupleName}</strong> ({targetInvitation?.slug})
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteTargetId(null)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Ya, Hapus Sekarang
          </Button>
        </div>
      </Modal>

      {/* Modal Buat Undangan Baru (Simulasi) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Undangan Baru"
        description="Mulai siapkan undangan pernikahan digital dengan memilih template favorit."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Nama Pasangan Mempelai</label>
            <input
              type="text"
              placeholder="Contoh: Romeo & Juliet"
              className="w-full rounded-xl border border-border p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Tanggal Acara Utama</label>
            <input
              type="date"
              className="w-full rounded-xl border border-border p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-xs text-primary flex items-center gap-2">
            <Sparkles size={16} />
            <span>Pilihan template tema dapat dipilih setelah undangan dibuat.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsCreateModalOpen(false)
                navigate('/dashboard/undangan/1')
              }}
            >
              Lanjutkan ke Panel
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}