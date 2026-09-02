import { useState, useEffect } from 'react'
import { Heart, Plus, Trash2, Calendar, Sparkles, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import { ImageUrlInput } from '@/components/ui/ImageUrlInput'
import { useLoveStories } from '@/hooks/useLoveStories'
import { parseApiError } from '@/lib/errorHandler'
import type { ApiLoveStory } from '@/types/invitation-api'

export type LoveStoryManagerProps = {
  /** ID undangan yang sedang dikelola */
  invitationId: string
  /** Daftar kisah cinta saat ini, diambil dari detail undangan */
  stories: ApiLoveStory[]
  /** Callback saat ada input draft momen baru */
  onDirtyChange?: (isDirty: boolean) => void
}

/**
 * Panel pengelola momen kisah cinta (Love Story) pasangan pengantin.
 * Memungkinkan mempelai menambahkan, mengedit (PATCH), dan menghapus (DELETE)
 * linimasa cerita perjalanan cinta mereka secara opsional, dilengkapi tanggal/tahun,
 * judul, narasi cerita, dan foto kenangan.
 */
export function LoveStoryManager({ invitationId, stories, onDirtyChange }: LoveStoryManagerProps) {
  const { addStory, updateStory, removeStory, isMutating } = useLoveStories(invitationId)

  // State untuk form tambah baru
  const [yearOrDate, setYearOrDate] = useState('')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [errors, setErrors] = useState<{
    yearOrDate?: string
    title?: string
    story?: string
    general?: string
  }>({})

  const isDirty = Boolean(yearOrDate.trim() || title.trim() || story.trim() || imageUrl.trim())

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // State untuk modal edit momen
  const [editTarget, setEditTarget] = useState<ApiLoveStory | null>(null)
  const [editYearOrDate, setEditYearOrDate] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editStory, setEditStory] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editErrors, setEditErrors] = useState<{
    yearOrDate?: string
    title?: string
    story?: string
    general?: string
  }>({})

  // State untuk modal konfirmasi hapus momen
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ApiLoveStory | null>(null)

  // State untuk modal pop-up status berhasil / gagal
  const [popupState, setPopupState] = useState<{
    isOpen: boolean
    status: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    status: 'success',
    title: '',
    message: '',
  })

  /**
   * Memvalidasi form dan mengirim data love story baru ke backend (POST).
   */
  function handleAdd() {
    const nextErrors: typeof errors = {}

    if (!yearOrDate.trim()) {
      nextErrors.yearOrDate = 'Tahun atau tanggal momen wajib diisi'
    }
    if (!title.trim()) {
      nextErrors.title = 'Judul momen wajib diisi'
    }
    if (!story.trim()) {
      nextErrors.story = 'Cerita momen wajib diisi'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})

    addStory.mutate(
      {
        yearOrDate: yearOrDate.trim(),
        title: title.trim(),
        story: story.trim(),
        imageUrl: imageUrl.trim() || null,
        order: stories.length + 1,
      },
      {
        onSuccess: () => {
          setYearOrDate('')
          setTitle('')
          setStory('')
          setImageUrl('')
          setErrors({})
          setPopupState({
            isOpen: true,
            status: 'success',
            title: 'Momen Berhasil Ditambahkan',
            message: 'Momen kisah cinta baru telah berhasil disimpan ke linimasa undangan Anda.',
          })
        },
        onError: (err) => {
          const parsed = parseApiError(err)
          const errorMsg =
            parsed.generalMessage ??
            parsed.allMessages[0] ??
            'Gagal menyimpan momen kisah cinta. Silakan periksa kembali data Anda.'
          setErrors({ general: errorMsg })
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Gagal Menambahkan Momen',
            message: errorMsg,
          })
        },
      },
    )
  }

  /**
   * Membuka modal edit dan mengisi form dengan data momen yang dipilih.
   */
  function handleStartEdit(item: ApiLoveStory) {
    setEditTarget(item)
    setEditYearOrDate(item.yearOrDate)
    setEditTitle(item.title)
    setEditStory(item.story)
    setEditImageUrl(item.imageUrl ?? '')
    setEditErrors({})
  }

  /**
   * Memvalidasi form edit dan mengirim pembaruan ke backend (PATCH).
   */
  function handleSaveEdit() {
    if (!editTarget) return

    const nextErrors: typeof editErrors = {}
    if (!editYearOrDate.trim()) {
      nextErrors.yearOrDate = 'Tahun atau tanggal momen wajib diisi'
    }
    if (!editTitle.trim()) {
      nextErrors.title = 'Judul momen wajib diisi'
    }
    if (!editStory.trim()) {
      nextErrors.story = 'Cerita momen wajib diisi'
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors)
      return
    }

    setEditErrors({})

    updateStory.mutate(
      {
        storyId: editTarget.id,
        payload: {
          yearOrDate: editYearOrDate.trim(),
          title: editTitle.trim(),
          story: editStory.trim(),
          imageUrl: editImageUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          const savedTitle = editTitle.trim()
          setEditTarget(null)
          setPopupState({
            isOpen: true,
            status: 'success',
            title: 'Momen Berhasil Diperbarui',
            message: `Momen "${savedTitle}" telah berhasil diperbarui.`,
          })
        },
        onError: (err) => {
          const parsed = parseApiError(err)
          const errorMsg =
            parsed.generalMessage ??
            parsed.allMessages[0] ??
            'Gagal memperbarui momen kisah cinta. Silakan periksa kembali data Anda.'
          setEditErrors({ general: errorMsg })
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Gagal Memperbarui Momen',
            message: errorMsg,
          })
        },
      },
    )
  }

  /**
   * Menjalankan penghapusan momen setelah dikonfirmasi via pop-up modal (DELETE).
   */
  function handleConfirmDelete() {
    if (!deleteConfirmTarget) return

    const targetId = deleteConfirmTarget.id
    const targetTitle = deleteConfirmTarget.title

    removeStory.mutate(targetId, {
      onSuccess: () => {
        setDeleteConfirmTarget(null)
        setPopupState({
          isOpen: true,
          status: 'success',
          title: 'Momen Berhasil Dihapus',
          message: `Momen "${targetTitle}" telah berhasil dihapus dari linimasa undangan.`,
        })
      },
      onError: (err) => {
        setDeleteConfirmTarget(null)
        const parsed = parseApiError(err)
        const errorMsg =
          parsed.generalMessage ??
          parsed.allMessages[0] ??
          'Gagal menghapus momen kisah cinta. Silakan coba lagi.'
        setPopupState({
          isOpen: true,
          status: 'error',
          title: 'Gagal Menghapus Momen',
          message: errorMsg,
        })
      },
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6 space-y-5">
      {/* Header Bagian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
              <Heart size={15} />
            </div>
            <h2 className="font-display text-base font-bold text-ink">
              Kisah Cinta / Love Story ({stories.length})
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Tambahkan rangkaian momen berkesan dan perjalanan cinta Anda berdua (opsional).
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full self-start sm:self-auto">
          <Sparkles size={12} className="text-amber-500" />
          Opsional
        </span>
      </div>

      {/* Daftar Kisah Cinta yang Sudah Tersimpan */}
      {stories.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
            Momen Tersimpan
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {stories.map((item, index) => (
              <div
                key={item.id || index}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50 hover:shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="primary" icon={<Calendar size={11} />}>
                      {item.yearOrDate}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => handleStartEdit(item)}
                        aria-label="Edit momen"
                        title="Edit momen ini"
                        className="cursor-pointer rounded-xl bg-white p-1.5 text-slate-600 opacity-70 shadow-2xs transition hover:opacity-100 hover:text-primary hover:bg-indigo-50 disabled:opacity-30"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => setDeleteConfirmTarget(item)}
                        aria-label="Hapus momen"
                        title="Hapus momen ini"
                        className="cursor-pointer rounded-xl bg-white p-1.5 text-danger opacity-70 shadow-2xs transition hover:opacity-100 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-bold text-ink">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.story}
                  </p>
                </div>

                {item.imageUrl && (
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-200 border border-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center">
          <Heart size={24} className="mx-auto text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-500">
            Belum ada momen kisah cinta yang ditambahkan.
          </p>
          <p className="text-[11px] text-muted">
            Gunakan formulir di bawah untuk menambahkan kisah awal bertemu, kencan pertama, atau momen lamaran.
          </p>
        </div>
      )}

      {/* Formulir Tambah Kisah Cinta Baru */}
      <div className="space-y-3.5 border-t border-slate-100 pt-4">
        <p className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          Tambah Momen Baru
        </p>

        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-danger">
            {errors.general}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Tahun / Tanggal */}
          <div>
            <label
              htmlFor="story-date"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
            >
              <Calendar size={13} className="text-primary" />
              <span>Tahun / Tanggal Momen</span>
            </label>
            <input
              id="story-date"
              type="text"
              value={yearOrDate}
              onChange={(e) => {
                setYearOrDate(e.target.value)
                setErrors((prev) => ({ ...prev, yearOrDate: undefined }))
              }}
              placeholder="Contoh: 2020 atau 14 Feb 2020"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
            />
            {errors.yearOrDate && (
              <p className="mt-1 text-[11px] font-medium text-danger">{errors.yearOrDate}</p>
            )}
          </div>

          {/* Judul Momen */}
          <div>
            <label
              htmlFor="story-title"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
            >
              <Sparkles size={13} className="text-primary" />
              <span>Judul Momen</span>
            </label>
            <input
              id="story-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              placeholder="Contoh: Pertama Kali Bertemu"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] font-medium text-danger">{errors.title}</p>
            )}
          </div>
        </div>

        {/* Cerita / Narasi */}
        <div>
          <label
            htmlFor="story-content"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
          >
            <Heart size={13} className="text-primary" />
            <span>Cerita Kisah Cinta</span>
          </label>
          <textarea
            id="story-content"
            rows={3}
            value={story}
            onChange={(e) => {
              setStory(e.target.value)
              setErrors((prev) => ({ ...prev, story: undefined }))
            }}
            placeholder="Kami pertama kali berkenalan di sebuah coffee shop di Yogyakarta..."
            className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
          />
          {errors.story && (
            <p className="mt-1 text-[11px] font-medium text-danger">{errors.story}</p>
          )}
        </div>

        {/* URL Foto Momen (Opsional) */}
        <ImageUrlInput
          label="URL Foto Momen (Opsional)"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="https://storage.buwuhan.com/photos/pertama-bertemu.jpg"
        />

        {/* Tombol Tambah */}
        <div className="pt-1">
          <Button
            type="button"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={handleAdd}
            isLoading={addStory.isPending}
          >
            Tambah Momen Kisah Cinta
          </Button>
        </div>
      </div>

      {/* Modal Edit Momen Kisah Cinta (PATCH /invitations/:id/stories/:storyId) */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Edit Momen Kisah Cinta"
        description="Perbarui informasi tanggal, judul, cerita, atau tautan foto kenangan momen ini."
        maxWidth="md"
        hideCloseButton={false}
      >
        <div className="space-y-4 pt-2">
          {editErrors.general && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-danger">
              {editErrors.general}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Tahun / Tanggal */}
            <div>
              <label
                htmlFor="edit-story-date"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
              >
                <Calendar size={13} className="text-primary" />
                <span>Tahun / Tanggal Momen</span>
              </label>
              <input
                id="edit-story-date"
                type="text"
                value={editYearOrDate}
                onChange={(e) => {
                  setEditYearOrDate(e.target.value)
                  setEditErrors((prev) => ({ ...prev, yearOrDate: undefined }))
                }}
                placeholder="Contoh: 2020 atau 14 Feb 2020"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
              />
              {editErrors.yearOrDate && (
                <p className="mt-1 text-[11px] font-medium text-danger">{editErrors.yearOrDate}</p>
              )}
            </div>

            {/* Judul Momen */}
            <div>
              <label
                htmlFor="edit-story-title"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
              >
                <Sparkles size={13} className="text-primary" />
                <span>Judul Momen</span>
              </label>
              <input
                id="edit-story-title"
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value)
                  setEditErrors((prev) => ({ ...prev, title: undefined }))
                }}
                placeholder="Contoh: Pertama Kali Bertemu"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
              />
              {editErrors.title && (
                <p className="mt-1 text-[11px] font-medium text-danger">{editErrors.title}</p>
              )}
            </div>
          </div>

          {/* Cerita / Narasi */}
          <div>
            <label
              htmlFor="edit-story-content"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
            >
              <Heart size={13} className="text-primary" />
              <span>Cerita Kisah Cinta</span>
            </label>
            <textarea
              id="edit-story-content"
              rows={3}
              value={editStory}
              onChange={(e) => {
                setEditStory(e.target.value)
                setEditErrors((prev) => ({ ...prev, story: undefined }))
              }}
              placeholder="Tuliskan cerita momen ini..."
              className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
            />
            {editErrors.story && (
              <p className="mt-1 text-[11px] font-medium text-danger">{editErrors.story}</p>
            )}
          </div>

          {/* URL Foto Momen */}
          <ImageUrlInput
            label="URL Foto Momen (Opsional)"
            value={editImageUrl}
            onChange={setEditImageUrl}
            placeholder="https://storage.buwuhan.com/photos/pertama-bertemu.jpg"
          />

          {/* Tombol Aksi Modal Edit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditTarget(null)}
              disabled={updateStory.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              icon={<Save size={15} />}
              onClick={handleSaveEdit}
              isLoading={updateStory.isPending}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Pop-up Konfirmasi Hapus Momen */}
      <Modal
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        maxWidth="sm"
        hideCloseButton={false}
      >
        <div className="py-2 text-center space-y-4">
          <AnimatedStatusIcon status="delete" size="md" />

          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Hapus Momen Kisah Cinta?
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus momen{' '}
              <strong className="text-ink font-semibold">"{deleteConfirmTarget?.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmTarget(null)}
              disabled={removeStory.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={handleConfirmDelete}
              isLoading={removeStory.isPending}
            >
              Hapus Momen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Pop-up Notifikasi Hasil Aksi (Animasi Ceklis & Silang) */}
      <Modal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
        maxWidth="sm"
        hideCloseButton={false}
      >
        <div className="py-2 text-center space-y-4">
          <AnimatedStatusIcon status={popupState.status} size="md" />

          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              {popupState.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              {popupState.message}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant={popupState.status === 'success' ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
            >
              {popupState.status === 'success' ? 'Selesai' : 'Tutup'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
