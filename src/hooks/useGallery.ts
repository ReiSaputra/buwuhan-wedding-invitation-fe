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
 * Endpoint:
 * - POST   /invitations/:invitationId/gallery
 * - POST   /invitations/:invitationId/gallery/bulk
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

  const addBulkPhotos = useMutation({
    mutationFn: async (photos: GalleryPhotoPayload[]) => {
      try {
        return await postData<{ count: number; photos: ApiGalleryPhoto[] }, { photos: GalleryPhotoPayload[] }>(
          `/invitations/${invitationId}/gallery/bulk`,
          { photos },
        )
      } catch {
        // Fallback simpan satu per satu jika backend belum ada endpoint bulk
        const results = await Promise.all(
          photos.map((p) =>
            postData<ApiGalleryPhoto, GalleryPhotoPayload>(
              `/invitations/${invitationId}/gallery`,
              p,
            ),
          ),
        )
        return { count: results.length, photos: results }
      }
    },
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
   * Menyusun ulang seluruh galeri.
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
    addBulkPhotos,
    removePhoto,
    updatePhoto,
    reorderPhotos,
    isMutating:
      addPhoto.isPending ||
      addBulkPhotos.isPending ||
      removePhoto.isPending ||
      updatePhoto.isPending ||
      reorderPhotos.isPending,
  }
}