import { useState, useRef, useEffect } from 'react'
import { useParams, useBlocker } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  Send,
  Archive,
  FileEdit,
  Check,
  Save,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import {
  InvitationForm,
  type InvitationFormHandle,
} from '@/components/dashboard/InvitationForm'
import { GalleryManager } from '@/components/panel/GalleryManager'
import { LoveStoryManager } from '@/components/panel/LoveStoryManager'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import {
  useUpdateInvitation,
  useUpdateInvitationStatus,
} from '@/hooks/useInvitationMutations'
import type { ApiEventCategory, ApiInvitationStatus, InvitationPayload } from '@/types/invitation-api'
import { cn } from '@/lib/cn'

const STATUS_OPTIONS: Array<{
  value: ApiInvitationStatus
  label: string
  hint: string
  icon: typeof Send
}> = [
  { value: 'DRAFT', label: 'Draft', hint: 'Belum dibagikan ke tamu', icon: FileEdit },
  { value: 'ACTIVE', label: 'Aktif', hint: 'Undangan dapat dibuka publik', icon: Send },
  { value: 'COMPLETED', label: 'Selesai', hint: 'Acara sudah berlangsung', icon: Archive },
]

/**
 * Halaman Edit Undangan pada panel per-undangan.
 * Memuat data undangan dari backend, menampilkannya di InvitationForm,
 * lalu menyimpan perubahan data dan status publikasi secara terpadu lewat "Simpan Perubahan".
 * Menyediakan pop-up peringatan jika berpindah halaman saat ada perubahan yang belum disimpan.
 */
export default function PanelEditPage() {
  const { id = '' } = useParams()
  const { rawInvitation, isFound, isLoading } = useInvitationDetail(id)
  const updateInvitation = useUpdateInvitation(id)
  const updateStatus = useUpdateInvitationStatus(id)

  const formRef = useRef<InvitationFormHandle>(null)
  const [selectedStatus, setSelectedStatus] = useState<ApiInvitationStatus>(
    rawInvitation?.status ?? 'DRAFT',
  )
  const [activeCategory, setActiveCategory] = useState<ApiEventCategory>(
    rawInvitation?.eventCategory ?? 'WEDDING',
  )
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [isGalleryDirty, setIsGalleryDirty] = useState(false)
  const [isLoveStoryDirty, setIsLoveStoryDirty] = useState(false)
  const [isSavingAndProceeding, setIsSavingAndProceeding] = useState(false)

  // Sinkronkan status lokal saat data awal dari server tiba
  useEffect(() => {
    if (!rawInvitation?.status) return

    const timeoutId = window.setTimeout(() => {
      setSelectedStatus(rawInvitation.status)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [rawInvitation?.status])

  // Sinkronkan jenis undangan lokal saat data awal dari server tiba
  useEffect(() => {
    if (!rawInvitation?.eventCategory) return

    const timeoutId = window.setTimeout(() => {
      setActiveCategory(rawInvitation.eventCategory!)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [rawInvitation?.eventCategory])

  // Status publikasi dianggap kotor jika pilihan user berbeda dengan data di database
  const isStatusDirty = Boolean(
    rawInvitation && selectedStatus !== rawInvitation.status,
  )

  // Form dianggap kotor jika ada field undangan, status, galeri, atau love story yang belum disimpan
  const isDirty = isFormDirty || isStatusDirty || isGalleryDirty || isLoveStoryDirty

  // Cegah navigasi keluar jika ada perubahan form yang belum disimpan
  const blocker = useBlocker(isDirty)

  // Cegah reload atau penutupan tab browser saat form kotor
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  /**
   * Menyimpan perubahan data undangan dan status publikasi secara bersamaan.
   */
  async function handleSubmit(payload: InvitationPayload) {
    await updateInvitation.mutateAsync(payload)
    if (isStatusDirty) {
      await updateStatus.mutateAsync(selectedStatus)
    }
    setIsFormDirty(false)
  }

  /**
   * Menyimpan data saat pop-up peringatan navigasi muncul, lalu melanjutkan navigasi ke tujuan.
   */
  async function handleSaveAndProceed() {
    setIsSavingAndProceeding(true)
    try {
      if (formRef.current && isFormDirty) {
        const success = await formRef.current.submit()
        if (!success) {
          setIsSavingAndProceeding(false)
          blocker.reset?.()
          return
        }
      }

      if (isStatusDirty) {
        await updateStatus.mutateAsync(selectedStatus)
      }

      setIsFormDirty(false)
      setIsGalleryDirty(false)
      setIsLoveStoryDirty(false)
      setIsSavingAndProceeding(false)
      blocker.proceed?.()
    } catch {
      setIsSavingAndProceeding(false)
      blocker.reset?.()
    }
  }

  /**
   * Membuang perubahan formulir dan status publikasi, lalu melanjutkan navigasi ke tujuan.
   */
  function handleDiscardAndProceed() {
    formRef.current?.reset()
    if (rawInvitation) {
      setSelectedStatus(rawInvitation.status)
      setActiveCategory(rawInvitation.eventCategory ?? 'WEDDING')
    }
    setIsFormDirty(false)
    setIsGalleryDirty(false)
    setIsLoveStoryDirty(false)
    blocker.proceed?.()
  }

  /**
   * Membatalkan perpindahan halaman dan tetap berada di form edit.
   */
  function handleStayOnPage() {
    blocker.reset?.()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white p-12 text-xs text-muted shadow-xs">
        <Loader2 size={16} className="animate-spin text-primary" />
        <span>Memuat data undangan…</span>
      </div>
    )
  }

  if (!isFound || !rawInvitation) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-danger">
          <AlertCircle size={28} />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-ink">
          Undangan Tidak Ditemukan
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
          Undangan mungkin sudah dihapus, atau kamu tidak memiliki akses ke undangan ini.
        </p>
      </div>
    )
  }

  const isSavingGeneral = updateInvitation.isPending || updateStatus.isPending

  return (
    <div className="space-y-5 pb-8">
      {/* Judul halaman */}
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Edit Undangan
        </h1>
        <p className="mt-1 text-xs text-muted">
          {activeCategory === 'KHITANAN' &&
            'Perbarui data ananda, tanggal, dan lokasi acara tasyakuran walimatul khitan.'}
          {activeCategory === 'AQIQAH' &&
            'Perbarui data kelahiran ananda, tanggal, dan lokasi acara aqiqah.'}
          {activeCategory === 'RASULAN' &&
            'Perbarui rincian kegiatan, tanggal, dan lokasi acara tradisi rasulan / sedekah bumi.'}
          {(!activeCategory || activeCategory === 'WEDDING') &&
            'Perbarui data mempelai, tanggal, dan lokasi acara resepsi serta akad nikah.'}
        </p>
      </div>

      {/* Pengubah status publikasi (hanya di-select secara lokal, disimpan saat tombol Simpan Perubahan diklik) */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Status Publikasi
          </p>
          {isStatusDirty && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Belum Disimpan
            </span>
          )}
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  'flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary bg-indigo-50/70 shadow-2xs ring-1 ring-primary/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Icon size={16} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold text-ink">
                    {option.label}
                    {isSelected && <Check size={13} className="text-primary" />}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{option.hint}</p>
                </div>
              </button>
            )
          })}
        </div>

        {updateStatus.isError && (
          <p className="mt-3 text-[11px] font-medium text-danger">
            Gagal mengubah status. Coba lagi.
          </p>
        )}
      </div>

      {/* Formulir data undangan */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6">
        <InvitationForm
          ref={formRef}
          id="panel-edit-invitation-form"
          key={rawInvitation.id}
          initialValue={rawInvitation}
          onSubmit={handleSubmit}
          isSubmitting={isSavingGeneral}
          hideSubmitButton
          onDirtyChange={setIsFormDirty}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Pengelola foto galeri undangan */}
      <GalleryManager
        invitationId={id}
        photos={rawInvitation.galleryPhotos ?? []}
        onDirtyChange={setIsGalleryDirty}
      />

      {/* Pengelola linimasa cerita & momen perjalanan (Story Timeline) */}
      <LoveStoryManager
        invitationId={id}
        stories={rawInvitation.loveStories ?? []}
        eventCategory={activeCategory}
        onDirtyChange={setIsLoveStoryDirty}
      />

      {/* Tombol Simpan Perubahan di paling bawah halaman */}
      <div className="flex items-center justify-end rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6">
        <Button
          type="submit"
          form="panel-edit-invitation-form"
          variant="primary"
          size="md"
          icon={<Save size={16} />}
          isLoading={isSavingGeneral}
          className="w-full sm:w-auto"
        >
          Simpan Perubahan
        </Button>
      </div>

      {/* Modal Peringatan Perubahan Belum Disimpan (Unsaved Changes Warning Modal) */}
      <Modal
        isOpen={blocker.state === 'blocked'}
        onClose={handleStayOnPage}
        maxWidth="sm"
        hideCloseButton={false}
      >
        <div className="py-2 text-center space-y-4">
          <AnimatedStatusIcon status="warning" size="md" />

          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Simpan Perubahan Undangan?
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Anda memiliki perubahan data atau status publikasi yang belum disimpan. Apakah Anda ingin menyimpan perubahan sebelum berpindah ke halaman lain?
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="button"
              variant="primary"
              icon={<Save size={15} />}
              className="w-full"
              onClick={handleSaveAndProceed}
              isLoading={isSavingAndProceeding || isSavingGeneral}
            >
              Simpan &amp; Lanjutkan
            </Button>

            <Button
              type="button"
              variant="ghost"
              icon={<Trash2 size={14} />}
              className="w-full text-danger hover:bg-rose-50"
              onClick={handleDiscardAndProceed}
              disabled={isSavingAndProceeding}
            >
              Buang Perubahan
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleStayOnPage}
              disabled={isSavingAndProceeding}
            >
              Batal (Tetap di Halaman Ini)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}