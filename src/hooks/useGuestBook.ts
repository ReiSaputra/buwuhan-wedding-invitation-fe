import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type { ApiGuestItem, GuestPayload } from '@/types/invitation-api'
import type { GuestBookEntry, NewGuestInput } from '@/types/panel'

/**
 * Menerjemahkan input formulir UI menjadi body request backend.
 * Backend memakai nama field `notes`, sementara UI memakai `note`.
 */
function toGuestPayload(input: NewGuestInput): GuestPayload {
  return {
    name: input.name,
    category: input.category || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    notes: input.note?.trim() || null,
  }
}

/**
 * Menerjemahkan satu tamu dari bentuk backend ke baris Buku Tamu di UI.
 * Status kehadiran diambil dari `isAttended` (hasil check-in / Scan QR),
 * dan waktu tercatat memakai `checkedInAt` bila sudah hadir.
 */
function toGuestBookEntry(guest: ApiGuestItem): GuestBookEntry {
  return {
    id: guest.id,
    name: guest.name,
    category: guest.category ?? 'Tanpa Kategori',
    status: guest.isAttended ? 'HADIR' : 'TIDAK_HADIR',
    recordedAt: guest.checkedInAt ?? guest.createdAt,
    phone: guest.phone ?? undefined,
    email: guest.email ?? undefined,
    message: guest.notes ?? undefined,
  }
}

/**
 * Hook pengelola data Buku Tamu: daftar tamu, catatan kehadiran, dan aksi
 * tambah/ubah/hapus yang tersambung ke backend.
 *
 * Endpoint yang dipakai:
 * - GET    /invitations/:id/guests
 * - POST   /invitations/:id/guests
 * - PATCH  /invitations/:id/guests/:guestId
 * - DELETE /invitations/:id/guests/:guestId
 *
 * @param invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `entries`, rekap `stats`, aksi mutasi, dan flag status
 */
export function useGuestBook(invitationId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(invitationId)

  const listQuery = useQuery({
    queryKey: ['invitation', invitationId, 'guests'],
    queryFn: () => fetchData<ApiGuestItem[]>(`/invitations/${invitationId}/guests`),
    enabled,
  })

  /**
   * Menyegarkan semua data turunan undangan ini (daftar tamu, statistik tamu,
   * statistik RSVP) sekaligus ringkasan dashboard.
   */
  function invalidateAll() {
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: (input: NewGuestInput) =>
      postData<ApiGuestItem, GuestPayload>(
        `/invitations/${invitationId}/guests`,
        toGuestPayload(input),
      ),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewGuestInput }) =>
      patchData<ApiGuestItem, GuestPayload>(
        `/invitations/${invitationId}/guests/${id}`,
        toGuestPayload(input),
      ),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`/invitations/${invitationId}/guests/${id}`),
    onSuccess: invalidateAll,
  })

  const entries = useMemo<GuestBookEntry[]>(
    () => (listQuery.data ?? []).map(toGuestBookEntry),
    [listQuery.data],
  )

  const stats = useMemo(
    () => ({
      total: entries.length,
      hadir: entries.filter((entry) => entry.status === 'HADIR').length,
      tidakHadir: entries.filter((entry) => entry.status === 'TIDAK_HADIR').length,
    }),
    [entries],
  )

  return {
    entries,
    stats,

    /** Menambahkan tamu baru ke undangan ini. */
    addGuest: (input: NewGuestInput) => createMutation.mutate(input),
    /** Memperbarui data satu tamu. */
    updateGuest: (id: string, input: NewGuestInput) => updateMutation.mutate({ id, input }),
    /** Menghapus satu tamu beserta RSVP-nya (cascade di backend). */
    removeGuest: (id: string) => deleteMutation.mutate(id),

    isLoading: enabled && listQuery.isLoading,
    isError: listQuery.isError,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    mutationError:
      createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
  }
}