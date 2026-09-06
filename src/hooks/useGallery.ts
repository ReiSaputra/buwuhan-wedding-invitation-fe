import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteData, patchData, postData } from '@/lib/api'
import type { ApiGalleryPhoto } from '@/types/invitation-api'

export type GalleryPhotoPayload = {
  imageUrl: string
  caption?: string | null
  order?: number
}

/** Body PATCH /invitations/:invitationId/gallery/:photoId — minimal satu field terisi. */
export type UpdateGalleryPhotoPayload = {
  imageUrl?: string
  caption?: string | null
  order?: number
}

/**
 * Hook aksi untuk mengelola foto galeri sebuah undangan.
 *
 * Daftar fotonya sendiri sudah ikut terbawa pada respon GET /invitations/:id
 * (properti `galleryPhotos`), sehingga hook ini hanya menyediakan aksi mutasi,
 * lalu menyegarkan cache detail undangan setelah berhasil.
 *
 * Endpoint:
 * - POST   /invitations/:invitationId/gallery
 * - PATCH  /invitations/:invitationId/gallery/:photoId
 * - DELETE /invitations/:invitationId/gallery/:photoId
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useGallery(invitationId: string) {
  const queryClient = useQueryClient()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
  }

  const addPhoto = useMutation({
    mutationFn: (payload: GalleryPhotoPayload) =>
      postData<ApiGalleryPhoto, GalleryPhotoPayload>(
        `/invitations/${invitationId}/gallery`,
        payload,
      ),
    onSuccess: invalidate,
  })

  const removePhoto = useMutation({
    mutationFn: (photoId: string) =>
      deleteData(`/invitations/${invitationId}/gallery/${photoId}`),
    onSuccess: invalidate,
  })

  /** Mengubah satu foto: keterangan, URL, atau posisi urutannya. */
  const updatePhoto = useMutation({
    mutationFn: ({ photoId, payload }: { photoId: string; payload: UpdateGalleryPhotoPayload }) =>
      patchData<ApiGalleryPhoto, UpdateGalleryPhotoPayload>(
        `/invitations/${invitationId}/gallery/${photoId}`,
        payload,
      ),
    onSuccess: invalidate,
  })

  /**
   * Menyusun ulang seluruh galeri. Backend belum punya endpoint reorder massal,
   * jadi urutan baru dikirim sebagai beberapa PATCH `order` sekaligus.
   *
   * @param orderedIds - ID foto sesuai urutan tampil yang diinginkan
   */
  const reorderPhotos = useMutation({
    mutationFn: (orderedIds: string[]) =>
      Promise.all(
        orderedIds.map((photoId, index) =>
          patchData<ApiGalleryPhoto, UpdateGalleryPhotoPayload>(
            `/invitations/${invitationId}/gallery/${photoId}`,
            { order: index },
          ),
        ),
      ),
    onSuccess: invalidate,
  })

  return {
    addPhoto,
    removePhoto,
    updatePhoto,
    reorderPhotos,
    isMutating:
      addPhoto.isPending ||
      removePhoto.isPending ||
      updatePhoto.isPending ||
      reorderPhotos.isPending,
  }
}