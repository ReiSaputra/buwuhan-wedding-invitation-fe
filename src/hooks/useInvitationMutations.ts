import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postData, patchData, deleteData } from '@/lib/api'
import type {
  ApiInvitation,
  ApiInvitationStatus,
  InvitationPayload,
  InvitationUpdatePayload,
} from '@/types/invitation-api'

/**
 * Membuat undangan baru lewat POST /invitations.
 *
 * @example
 * const createInvitation = useCreateInvitation()
 * await createInvitation.mutateAsync(payload)
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvitationPayload) =>
      postData<ApiInvitation, InvitationPayload>('/invitations', payload),
    onSuccess: () => {
      // Daftar undangan & statistik dashboard ikut berubah, jadi minta ulang.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

/**
 * Memperbarui data undangan lewat PATCH /invitations/:id.
 *
 * @param id - ID undangan yang sedang diedit
 */
export function useUpdateInvitation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvitationUpdatePayload) =>
      patchData<ApiInvitation, InvitationUpdatePayload>(`/invitations/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
    },
  })
}

/**
 * Mengubah status publikasi undangan lewat PATCH /invitations/:id/status.
 * Nilai status yang diterima backend hanya DRAFT, ACTIVE, atau COMPLETED.
 *
 * @param id - ID undangan yang statusnya diubah
 */
export function useUpdateInvitationStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ApiInvitationStatus) =>
      patchData<ApiInvitation, { status: ApiInvitationStatus }>(
        `/invitations/${id}/status`,
        { status },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
    },
  })
}

/**
 * Menghapus undangan lewat DELETE /invitations/:id.
 * ID dikirim saat mutate, bukan saat hook dipanggil, supaya satu hook
 * bisa dipakai untuk semua kartu di daftar undangan.
 */
export function useDeleteInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteData(`/invitations/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.removeQueries({ queryKey: ['invitation', id] })
    },
  })
}

/**
 * Mengubah teks bebas menjadi slug yang diterima backend.
 * Aturan backend: /^[a-z0-9]+(-[a-z0-9]+)*$/ , minimal 3 maksimal 100 karakter.
 *
 * @example
 * slugify('Hanung & Ratna') // -> "hanung-ratna"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // buang karakter selain huruf kecil, angka, spasi, strip
    .replace(/[\s-]+/g, '-')       // spasi/strip berulang jadi satu strip
    .replace(/^-+|-+$/g, '')       // buang strip di awal & akhir
    .slice(0, 100)
}