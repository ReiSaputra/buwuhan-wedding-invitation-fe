import { useState, useDeferredValue } from 'react'
import {
  Palette,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  Flame,
  Loader2,
} from 'lucide-react'
import {
  useAdminTemplates,
  useRestoreTemplate,
  useDeactivateTemplate,
} from '@/hooks/useAdmin'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QueryState } from '@/components/common/QueryState'
import { parseApiError } from '@/lib/errorHandler'
import type { AdminTemplate, PlanTier } from '@/types/admin'

export default function AdminTemplatesPage() {
  // State filter & pencarian
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [activeFilter, setActiveFilter] = useState<boolean | 'ALL'>('ALL')
  const [tierFilter, setTierFilter] = useState<PlanTier | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL')

  // Fetching data
  const { data, isLoading, isError } = useAdminTemplates({
    page,
    limit: 12,
    search: deferredSearch,
    isActive: activeFilter,
    tier: tierFilter,
    eventCategory: categoryFilter,
  })

  // Mutasi
  const restoreMutation = useRestoreTemplate()
  const deactivateMutation = useDeactivateTemplate()

  // State Modal Konfirmasi
  const [targetTemplate, setTargetTemplate] = useState<AdminTemplate | null>(null)
  const [actionType, setActionType] = useState<'DEACTIVATE' | 'RESTORE'>('DEACTIVATE')

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
  function openActionModal(template: AdminTemplate, type: 'DEACTIVATE' | 'RESTORE') {
    setTargetTemplate(template)
    setActionType(type)
  }

  async function handleConfirmAction() {
    if (!targetTemplate) return

    try {
      if (actionType === 'DEACTIVATE') {
        await deactivateMutation.mutateAsync(targetTemplate.id)
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Template Dinonaktifkan',
          message: `Template "${targetTemplate.name}" berhasil dinonaktifkan (diarsipkan). Pengguna baru tidak dapat memilih template ini.`,
        })
      } else {
        await restoreMutation.mutateAsync(targetTemplate.id)
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Template Dipulihkan',
          message: `Template "${targetTemplate.name}" berhasil dipulihkan. Template kini kembali aktif di katalog publik.`,
        })
      }
      setTargetTemplate(null)
    } catch (err) {
      const parsed = parseApiError(err)
      setFeedback({
        isOpen: true,
        type: 'error',
        title: actionType === 'DEACTIVATE' ? 'Gagal Menonaktifkan' : 'Gagal Memulihkan',
        message: parsed.generalMessage || 'Terjadi kesalahan saat memproses permintaan.',
      })
    }
  }

  const renderTierBadge = (tier: PlanTier) => {
    switch (tier) {
      case 'MAX':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shadow-xs">
            MAX
          </span>
        )
      case 'PRO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
            PRO
          </span>
        )
      case 'FREE':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-white shadow-xs">
            FREE
          </span>
        )
    }
  }

  const renderCategoryBadge = (category: string) => {
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

  const templates = data?.templates || []
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-slate-800" />
            Katalog & Pengelolaan Template
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola status publikasi template, pantau popularitas penggunaan, dan pulihkan tema terarsip.
          </p>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
          {/* Search Input */}
          <div className="flex-1 min-w-[220px]">
            <SearchInput
              value={searchInput}
              onChange={(val) => {
                setSearchInput(val)
                setPage(1)
              }}
              placeholder="Cari nama template atau slug..."
            />
          </div>

          {/* Filter Status Aktif / Terarsip */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
            <select
              value={activeFilter === 'ALL' ? 'ALL' : activeFilter ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value
                setActiveFilter(val === 'ALL' ? 'ALL' : val === 'true')
                setPage(1)
              }}
              aria-label="Filter status aktif template"
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="true">Aktif Saja</option>
              <option value="false">Terarsip Saja</option>
            </select>
          </div>

          {/* Filter Tier */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value as PlanTier | 'ALL')
                setPage(1)
              }}
              aria-label="Filter paket tier template"
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">Semua Tier</option>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="MAX">MAX</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              aria-label="Filter kategori acara template"
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
      </div>

      {/* Grid Templates */}
      <QueryState isLoading={isLoading} isError={isError}>
        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
            <Palette className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak Ada Template Ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau filter status dan paket tier template.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {templates.map((template) => {
            const isProcessing =
              (deactivateMutation.isPending || restoreMutation.isPending) &&
              targetTemplate?.id === template.id

            return (
              <div
                key={template.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
                  template.isActive
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-dashed border-slate-300 bg-slate-50/60 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden group">
                  {template.previewImageUrl ? (
                    <img
                      src={template.previewImageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-4 text-center">
                      <Palette className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-bold tracking-tight">{template.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5">/{template.slug}</span>
                    </div>
                  )}

                  {/* Badges Overlay Top */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    {renderTierBadge(template.tier)}
                    {template.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/90 backdrop-blur-xs text-white">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 backdrop-blur-xs text-slate-200">
                        Terarsip
                      </span>
                    )}
                  </div>

                  {/* Usage count badge top right */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {template.usageCount} pakai
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {renderCategoryBadge(template.eventCategory)}
                      <span className="text-xs font-mono text-slate-400 truncate">
                        /{template.slug}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      ID: {template.id.slice(0, 8)}...
                    </span>

                    {template.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionModal(template, 'DEACTIVATE')}
                        disabled={isProcessing}
                        className="text-xs text-slate-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 inline-flex items-center gap-1"
                      >
                        <Archive className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                        Nonaktifkan
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionModal(template, 'RESTORE')}
                        disabled={isProcessing}
                        className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-600" />
                        Pulihkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </QueryState>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500">
            Menampilkan {templates.length} dari {pagination.total} template
          </p>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI AKSI (DEACTIVATE / RESTORE) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(targetTemplate)}
        onClose={() => setTargetTemplate(null)}
        title={actionType === 'DEACTIVATE' ? 'Nonaktifkan Template' : 'Pulihkan Template'}
      >
        <div className="space-y-4">
          {actionType === 'DEACTIVATE' ? (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Perhatian:</p>
                  <p className="mt-0.5">
                    Menonaktifkan template <strong>"{targetTemplate?.name}"</strong> akan menyembunyikannya dari katalog pemilihan tema untuk pengguna baru. Undangan yang saat ini sudah memakai template ini tetap dapat menampilkannya secara normal.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Apakah Anda yakin ingin menonaktifkan template ini?
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Informasi Pemulihan:</p>
                  <p className="mt-0.5">
                    Memulihkan template <strong>"{targetTemplate?.name}"</strong> akan menjadikannya kembali aktif dan dapat langsung dipilih oleh pengguna di katalog tema.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Apakah Anda ingin mengaktifkan kembali template ini ke katalog publik?
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTargetTemplate(null)}
              disabled={deactivateMutation.isPending || restoreMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAction}
              disabled={deactivateMutation.isPending || restoreMutation.isPending}
              className={
                actionType === 'DEACTIVATE'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {deactivateMutation.isPending || restoreMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Memproses...
                </>
              ) : actionType === 'DEACTIVATE' ? (
                'Ya, Nonaktifkan'
              ) : (
                'Ya, Pulihkan'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL FEEDBACK */}
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
