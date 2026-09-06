import { useState, useEffect, useMemo, useRef, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Pencil, Trash2, UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import { ImageUrlInput } from '@/components/ui/ImageUrlInput'
import { useGallery } from '@/hooks/useGallery'
import { parseApiError } from '@/lib/errorHandler'
import type { ApiGalleryPhoto } from '@/types/invitation-api'

export type GalleryManagerProps = {
  /** ID undangan yang sedang dikelola */
  invitationId: string
  /** Daftar foto galeri saat ini, diambil dari detail undangan */
  photos: ApiGalleryPhoto[]
  /** Callback saat ada input draft foto baru */
  onDirtyChange?: (isDirty: boolean) => void
}

/**
 * Panel pengelola foto galeri undangan.
 * Dilengkapi input pratinjau gambar, unggah berkas tunggal & massal,
 * modal konfirmasi hapus foto dengan animasi, serta pop-up hasil status.
 */
export function GalleryManager({ invitationId, photos, onDirtyChange }: GalleryManagerProps) {
  const { addPhoto, addBulkPhotos, removePhoto, updatePhoto, reorderPhotos, isMutating } =
    useGallery(invitationId)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  // State untuk bulk upload
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null)

  const isDirty = Boolean(imageUrl.trim() || caption.trim())

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // State untuk modal konfirmasi hapus foto
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ApiGalleryPhoto | null>(null)

  // State untuk modal ubah keterangan foto
  const [editTarget, setEditTarget] = useState<ApiGalleryPhoto | null>(null)
  const [editCaption, setEditCaption] = useState('')

  // Urutkan foto sesuai order
  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.order - b.order),
    [photos],
  )

  // State untuk pop-up notifikasi hasil aksi
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

  /** Memvalidasi URL lalu mengirim foto baru ke backend. */
  function handleAdd() {
    const trimmed = imageUrl.trim()

    if (!trimmed) {
      setError('Foto wajib diunggah atau diisi URL gambar')
      return
    }

    setError(undefined)
    addPhoto.mutate(
      { imageUrl: trimmed, caption: caption.trim() || null, order: photos.length },
      {
        onSuccess: () => {
          setImageUrl('')
          setCaption('')
          setPopupState({
            isOpen: true,
            status: 'success',
            title: 'Foto Berhasil Ditambahkan',
            message: 'Foto galeri baru telah berhasil disimpan ke album undangan Anda.',
          })
        },
        onError: (err) => {
          const parsed = parseApiError(err)
          const msg = parsed.generalMessage ?? parsed.allMessages[0] ?? 'Gagal menyimpan foto. Coba lagi.'
          setError(msg)
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Gagal Menambahkan Foto',
            message: msg,
          })
        },
      },
    )
  }

  function handleBulkFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setBulkFiles(files)
    }
  }

  async function handleExecuteBulkUpload() {
    if (bulkFiles.length === 0) return
    setIsBulkProcessing(true)

    try {
      // Baca seluruh file menjadi DataURL
      const readPromises = bulkFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })

      const dataUrls = await Promise.all(readPromises)
      const currentCount = photos.length
      const payloads = dataUrls.map((url, idx) => ({
        imageUrl: url,
        caption: null,
        order: currentCount + idx,
      }))

      await addBulkPhotos.mutateAsync(payloads)
      setIsBulkModalOpen(false)
      setBulkFiles([])
      setPopupState({
        isOpen: true,
        status: 'success',
        title: 'Galeri Berhasil Diperbarui',
        message: `${payloads.length} foto baru telah ditambahkan ke album pernikahan Anda.`,
      })
    } catch {
      setPopupState({
        isOpen: true,
        status: 'error',
        title: 'Gagal Mengunggah Foto Massal',
        message: 'Terjadi kendala saat menyimpan foto-foto galeri.',
      })
    } finally {
      setIsBulkProcessing(false)
    }
  }

  /** Mengubah urutan foto di galeri. */
  function handleMove(currentIndex: number, direction: -1 | 1) {
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= sortedPhotos.length) return

    const reordered = [...sortedPhotos]
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    reorderPhotos.mutate(
      reordered.map((photo) => photo.id),
      {
        onError: (err) => {
          const parsed = parseApiError(err)
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Gagal Mengubah Urutan',
            message:
              parsed.generalMessage ?? parsed.allMessages[0] ?? 'Gagal menyimpan urutan foto.',
          })
        },
      },
    )
  }

  function handleOpenEdit(photo: ApiGalleryPhoto) {
    setEditTarget(photo)
    setEditCaption(photo.caption ?? '')
  }

  function handleSaveCaption() {
    if (!editTarget) return
    updatePhoto.mutate(
      {
        photoId: editTarget.id,
        payload: { caption: editCaption.trim() || null },
      },
      {
        onSuccess: () => {
          setEditTarget(null)
          setPopupState({
            isOpen: true,
            status: 'success',
            title: 'Keterangan Disimpan',
            message: 'Keterangan foto berhasil diperbarui.',
          })
        },
        onError: (err) => {
          const parsed = parseApiError(err)
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Gagal Menyimpan Keterangan',
            message:
              parsed.generalMessage ?? parsed.allMessages[0] ?? 'Gagal memperbarui keterangan foto.',
          })
        },
      },
    )
  }

  function handleConfirmDelete() {
    if (!deleteConfirmTarget) return
    removePhoto.mutate(deleteConfirmTarget.id, {
      onSuccess: () => {
        setDeleteConfirmTarget(null)
        setPopupState({
          isOpen: true,
          status: 'success',
          title: 'Foto Dihapus',
          message: 'Foto berhasil dihapus dari galeri undangan.',
        })
      },
      onError: (err) => {
        const parsed = parseApiError(err)
        setPopupState({
          isOpen: true,
          status: 'error',
          title: 'Gagal Menghapus Foto',
          message:
            parsed.generalMessage ?? parsed.allMessages[0] ?? 'Foto tidak dapat dihapus. Coba lagi.',
        })
      },
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          Galeri Foto ({photos.length})
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<UploadCloud size={14} />}
          onClick={() => setIsBulkModalOpen(true)}
        >
          Unggah Banyak Sekaligus
        </Button>
      </div>

      {/* Daftar foto yang sudah tersimpan */}
      {sortedPhotos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sortedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption ?? 'Foto galeri'}
                loading="lazy"
                className="h-full w-full object-cover"
              />

              {/* Nomor urut tampil */}
              <span className="absolute top-2 left-2 rounded-lg bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>

              {/* Aksi ubah & hapus */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => handleOpenEdit(photo)}
                  aria-label="Ubah keterangan foto"
                  title="Ubah keterangan"
                  className="cursor-pointer rounded-xl bg-white/90 p-1.5 text-slate-600 opacity-70 shadow-sm transition hover:bg-indigo-50 hover:text-primary hover:opacity-100 disabled:opacity-30 group-hover:opacity-100"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => setDeleteConfirmTarget(photo)}
                  aria-label="Hapus foto"
                  className="cursor-pointer rounded-xl bg-white/90 p-1.5 text-danger opacity-70 shadow-sm transition hover:opacity-100 hover:bg-red-50 disabled:opacity-30 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Tombol geser urutan */}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-xl bg-black/45 p-1 backdrop-blur-xs">
                <button
                  type="button"
                  disabled={isMutating || index === 0}
                  onClick={() => handleMove(index, -1)}
                  aria-label="Geser foto ke kiri"
                  title="Geser ke kiri"
                  className="cursor-pointer rounded-lg bg-white/85 p-1 text-slate-600 transition hover:bg-white disabled:opacity-25"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  disabled={isMutating || index === sortedPhotos.length - 1}
                  onClick={() => handleMove(index, 1)}
                  aria-label="Geser foto ke kanan"
                  title="Geser ke kanan"
                  className="cursor-pointer rounded-lg bg-white/85 p-1 text-slate-600 transition hover:bg-white disabled:opacity-25"
                >
                  <ArrowRight size={12} />
                </button>
                <p className="truncate text-[10px] font-medium text-white/90">
                  {photo.caption || 'Tanpa keterangan'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulir tambah foto tunggal */}
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <ImageUrlInput
          label="Foto Baru"
          value={imageUrl}
          onChange={setImageUrl}
          error={error}
          folder="gallery"
        />

        <div>
          <label
            htmlFor="gallery-caption"
            className="text-[11px] font-bold tracking-wider text-slate-600 uppercase"
          >
            Keterangan (opsional)
          </label>
          <input
            id="gallery-caption"
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Sesi prewedding di Kaliurang"
            className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
          />
        </div>

        <Button
          type="button"
          variant="primary"
          icon={<ImagePlus size={15} />}
          onClick={handleAdd}
          isLoading={addPhoto.isPending}
        >
          Tambah Foto ke Galeri
        </Button>
      </div>

      {/* Modal Bulk Upload Foto */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Unggah Banyak Foto Galeri Sekaligus"
        description="Pilih beberapa file gambar (PNG, JPG, WebP) untuk dimasukkan ke album pernikahan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <input
            ref={bulkFileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            multiple
            onChange={handleBulkFilesSelected}
            className="hidden"
          />

          <div
            onClick={() => bulkFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center hover:border-primary hover:bg-indigo-50/50 transition cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs text-primary border border-slate-100">
              <UploadCloud size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                Klik untuk memilih beberapa foto sekaligus
              </p>
              <p className="text-[11px] text-slate-400">
                Pilih hingga 20 foto per upload (PNG, JPG, WebP)
              </p>
            </div>
          </div>

          {bulkFiles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>{bulkFiles.length} file terpilih:</span>
                <button
                  type="button"
                  onClick={() => setBulkFiles([])}
                  className="text-danger text-[11px] hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {bulkFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl"
                  >
                    <span className="truncate max-w-[240px]">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={bulkFiles.length === 0 || isBulkProcessing}
              isLoading={isBulkProcessing}
              onClick={handleExecuteBulkUpload}
              icon={isBulkProcessing ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />}
            >
              Unggah {bulkFiles.length > 0 ? `(${bulkFiles.length} Foto)` : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Ubah Keterangan Foto */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Ubah Keterangan Foto"
        maxWidth="sm"
        hideCloseButton={false}
      >
        <div className="space-y-4">
          {editTarget && (
            <img
              src={editTarget.imageUrl}
              alt={editTarget.caption ?? 'Pratinjau foto'}
              className="h-40 w-full rounded-2xl border border-slate-100 object-cover"
            />
          )}

          <div>
            <label
              htmlFor="gallery-edit-caption"
              className="text-[11px] font-bold tracking-wider text-slate-600 uppercase"
            >
              Keterangan
            </label>
            <input
              id="gallery-edit-caption"
              type="text"
              value={editCaption}
              maxLength={500}
              onChange={(event) => setEditCaption(event.target.value)}
              placeholder="Sesi prewedding di Kaliurang"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink shadow-2xs transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              {editCaption.length}/500 karakter. Kosongkan untuk menghapus keterangan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditTarget(null)}
              disabled={updatePhoto.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveCaption}
              isLoading={updatePhoto.isPending}
            >
              Simpan Keterangan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Pop-up Konfirmasi Hapus Foto */}
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
              Hapus Foto Galeri?
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus foto ini dari galeri undangan? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmTarget(null)}
              disabled={removePhoto.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={handleConfirmDelete}
              isLoading={removePhoto.isPending}
            >
              Hapus Foto
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Pop-up Notifikasi Hasil Aksi */}
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