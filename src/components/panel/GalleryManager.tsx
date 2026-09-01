import { useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImageUrlInput } from '@/components/ui/ImageUrlInput'
import { useGallery } from '@/hooks/useGallery'
import type { ApiGalleryPhoto } from '@/types/invitation-api'

export type GalleryManagerProps = {
  /** ID undangan yang sedang dikelola */
  invitationId: string
  /** Daftar foto galeri saat ini, diambil dari detail undangan */
  photos: ApiGalleryPhoto[]
}

/**
 * Panel pengelola foto galeri undangan.
 * Memakai ImageUrlInput sehingga pengguna melihat pratinjau gambar sebelum
 * menyimpannya. Setelah backend menyediakan endpoint unggah berkas, cukup
 * ganti isi ImageUrlInput tanpa mengubah komponen ini.
 */
export function GalleryManager({ invitationId, photos }: GalleryManagerProps) {
  const { addPhoto, removePhoto, isMutating } = useGallery(invitationId)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

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
        },
        onError: () => setError('Gagal menyimpan foto. Coba lagi.'),
      },
    )
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
                onClick={() => removePhoto.mutate(photo.id)}
                aria-label="Hapus foto"
                className="absolute top-2 right-2 cursor-pointer rounded-xl bg-white/90 p-1.5 text-danger opacity-0 shadow-sm transition group-hover:opacity-100"
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
    </div>
  )
}