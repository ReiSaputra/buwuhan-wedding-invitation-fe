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
        icon={<AlertTriangle size={20} className="text-amber-600" />}
        title="Hapus Undangan?"
        description="Tindakan ini permanen dan akan menghapus seluruh data tamu, konfirmasi kehadiran, serta buku ucapan terkait."
        maxWidth="md"
      >
        <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/80 flex items-start gap-3.5 text-amber-900 text-xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="font-semibold">Undangan yang akan dihapus:</p>
            <p className="mt-0.5 text-ink font-bold">{targetInvitation?.coupleName}</p>
            <p className="text-[11px] text-muted">Slug: /undangan/{targetInvitation?.slug}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
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

      {/* Modal Buat Undangan Baru */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        icon={<Sparkles size={20} className="text-primary" />}
        title="Buat Undangan Baru"
        description="Lengkapi detail awal pasangan dan tanggal acara untuk membuat website undangan pernikahan."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const coupleName = (form.elements.namedItem('coupleName') as HTMLInputElement)?.value || 'Mempelai Baru'
            const dateVal = (form.elements.namedItem('eventDate') as HTMLInputElement)?.value || '2026-10-20'
            const slugVal = (form.elements.namedItem('slug') as HTMLInputElement)?.value || coupleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            
            const newInv: InvitationSummary = {
              id: `inv-${Date.now()}`,
              coupleName,
              slug: slugVal,
              eventDate: dateVal,
              eventTime: '09:00',
              status: 'DRAFT',
              guestCount: 0,
              checkedInCount: 0,
              thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
            }

            setInvitationsList((prev) => [newInv, ...prev])
            setIsCreateModalOpen(false)
            navigate(`/dashboard/undangan/${newInv.id}`)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Pasangan Mempelai <span className="text-danger">*</span>
            </label>
            <input
              name="coupleName"
              type="text"
              required
              placeholder="Contoh: Han & Saputra"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-ink placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tautan / Slug Undangan <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-slate-400 font-medium select-none">/undangan/</span>
                <input
                  name="slug"
                  type="text"
                  placeholder="han-saputra"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-24 pr-3 py-3 text-xs text-ink placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Acara Utama <span className="text-danger">*</span>
              </label>
              <input
                name="eventDate"
                type="date"
                required
                defaultValue="2026-10-20"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-ink focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilihan Template Desain Awal
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Royal Floral', desc: 'Elegan & Bunga', active: true },
                { name: 'Modern Minimalist', desc: 'Bersih & Simpel', active: false },
                { name: 'Javanese Classic', desc: 'Adat & Budaya', active: false },
              ].map((theme, idx) => (
                <div
                  key={theme.name}
                  className={cn(
                    'rounded-xl border p-2.5 text-center cursor-pointer transition-all',
                    idx === 0
                      ? 'border-primary bg-indigo-50/60 text-primary ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-600',
                  )}
                >
                  <p className="text-xs font-bold">{theme.name}</p>
                  <p className="text-[10px] text-muted mt-0.5">{theme.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-50/70 p-3 text-xs text-primary flex items-center gap-2 border border-indigo-100">
            <Sparkles size={16} className="shrink-0 text-amber-500" />
            <span>Foto galeri, kisah cinta, lokasi Google Maps, dan buku tamu dapat diatur setelah undangan dibuat.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
            >
              Buat Undangan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}