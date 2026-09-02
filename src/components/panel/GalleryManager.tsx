import { useState, useEffect } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
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
 * Dilengkapi input pratinjau gambar, modal konfirmasi hapus foto dengan animasi,
 * serta pop-up hasil status.
 */
export function GalleryManager({ invitationId, photos, onDirtyChange }: GalleryManagerProps) {
  const { addPhoto, removePhoto, isMutating } = useGallery(invitationId)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  const isDirty = Boolean(imageUrl.trim() || caption.trim())

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // State untuk modal konfirmasi hapus foto
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ApiGalleryPhoto | null>(null)

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
      setError('URL gambar wajib diisi')
      return
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError('URL harus diawali http:// atau https://')
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

  /** Menghapus foto galeri setelah dikonfirmasi via modal */
  function handleConfirmDelete() {
    if (!deleteConfirmTarget) return

    removePhoto.mutate(deleteConfirmTarget.id, {
      onSuccess: () => {
        setDeleteConfirmTarget(null)
        setPopupState({
          isOpen: true,
          status: 'success',
          title: 'Foto Berhasil Dihapus',
          message: 'Foto galeri telah berhasil dihapus dari album undangan.',
        })
      },
      onError: (err) => {
        setDeleteConfirmTarget(null)
        const parsed = parseApiError(err)
        const msg = parsed.generalMessage ?? parsed.allMessages[0] ?? 'Gagal menghapus foto. Coba lagi.'
        setPopupState({
          isOpen: true,
          status: 'error',
          title: 'Gagal Menghapus Foto',
          message: msg,
        })
      },
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6">
      <p className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
        Galeri Foto ({photos.length})
      </p>

      {/* Daftar foto yang sudah tersimpan */}
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
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
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setDeleteConfirmTarget(photo)}
                aria-label="Hapus foto"
                className="absolute top-2 right-2 cursor-pointer rounded-xl bg-white/90 p-1.5 text-danger opacity-70 shadow-sm transition hover:opacity-100 hover:bg-red-50 disabled:opacity-30 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulir tambah foto */}
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <ImageUrlInput
          label="URL Foto Baru"
          value={imageUrl}
          onChange={setImageUrl}
          error={error}
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
          Tambah Foto
        </Button>
      </div>

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