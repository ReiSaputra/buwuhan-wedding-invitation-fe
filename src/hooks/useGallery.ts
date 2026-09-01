import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteData, postData } from '@/lib/api'
import type { ApiGalleryPhoto } from '@/types/invitation-api'

export type GalleryPhotoPayload = {
  imageUrl: string
  caption?: string | null
  order?: number
}

/**
 * Hook aksi untuk mengelola foto galeri sebuah undangan.
 *
 * Daftar fotonya sendiri sudah ikut terbawa pada respon GET /invitations/:id
 * (properti `galleryPhotos`), sehingga hook ini hanya menyediakan aksi tambah
 * dan hapus, lalu menyegarkan cache detail undangan setelah berhasil.
 *
 * Endpoint:
 * - POST   /invitations/:invitationId/gallery
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

  return {
    addPhoto,
    removePhoto,
    isMutating: addPhoto.isPending || removePhoto.isPending,
  }
}