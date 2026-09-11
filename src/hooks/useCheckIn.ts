import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData } from "@/lib/api";
import { parseApiError } from "@/lib/errorHandler";
import type {
  ApiGuestItem,
  CheckInPayload,
  CheckOutPayload,
  GuestStatsApiData,
} from "@/types/invitation-api";

const EMPTY_STATS: GuestStatsApiData = {
  totalGuests: 0,
  totalAttended: 0,
  totalPending: 0,
  totalPaxExpected: 0,
  totalPaxActual: 0,
  byCategory: {},
};

/**
 * Hook presensi tamu (Scan QR): daftar tamu, statistik kehadiran,
 * serta aksi check-in dan check-out yang tersambung ke backend.
 *
 * Endpoint:
 * - GET  /invitations/:id/guests
 * - GET  /invitations/:id/guests/stats
 * - POST /invitations/:id/guests/check-in
 * - GET  /public/invitations/:slug/guests/verify/:qrCode
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useCheckIn(invitationId: string, invitationSlug?: string) {
  const queryClient = useQueryClient();
  const enabled = Boolean(invitationId);

  const guestsQuery = useQuery({
    queryKey: ["invitation", invitationId, "guests"],
    queryFn: () =>
      fetchData<ApiGuestItem[]>(`/invitations/${invitationId}/guests`),
    enabled,
  });

  const statsQuery = useQuery({
    queryKey: ["invitation", invitationId, "guest-stats"],
    queryFn: () =>
      fetchData<GuestStatsApiData>(`/invitations/${invitationId}/guests/stats`),
    enabled,
  });

  /** Menyegarkan daftar tamu, statistik, dan ringkasan dashboard. */
  function invalidateAll() {
    void queryClient.invalidateQueries({
      queryKey: ["invitation", invitationId],
    });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  /**
   * Memverifikasi token QR ke backend TANPA mengubah status kehadiran.
   * Dipakai untuk menampilkan pratinjau tamu sebelum petugas menekan konfirmasi.
   *
   * @param qrCode - Token QR bersih hasil extractQrCode()
   * @returns Data tamu bila valid
   * @throws Error 404 bila QR tidak dikenali pada undangan ini
   */
  async function verifyQr(qrCode: string): Promise<ApiGuestItem> {
    if (!invitationSlug) {
      throw new Error("Slug undangan belum tersedia");
    }
    const cleanCode = qrCode.trim();
    return fetchData<ApiGuestItem>(
      `/public/invitations/${encodeURIComponent(invitationSlug)}/guests/verify/${encodeURIComponent(cleanCode)}`,
    );
  }

  const checkInMutation = useMutation({
    mutationFn: (payload: CheckInPayload) =>
      postData<ApiGuestItem, CheckInPayload>(
        `/invitations/${invitationId}/guests/check-in`,
        payload,
      ),
    onSuccess: invalidateAll,
  });

  const checkOutMutation = useMutation({
    mutationFn: (payload: CheckOutPayload) =>
      postData<ApiGuestItem, CheckOutPayload>(
        `/invitations/${invitationId}/guests/check-out`,
        payload,
      ),
    onSuccess: invalidateAll,
  });

  const guests = useMemo(() => guestsQuery.data ?? [], [guestsQuery.data]);

  const recentCheckIns = useMemo(
    () =>
      guests
        .filter((guest) => guest.isAttended && guest.checkedInAt)
        .sort((a, b) => (a.checkedInAt! < b.checkedInAt! ? 1 : -1))
        .slice(0, 8),
    [guests],
  );

  return {
    guests,
    recentCheckIns,
    stats: statsQuery.data ?? EMPTY_STATS,
    /** Pratinjau tamu dari token QR, tanpa mencatat kehadiran. */
    verifyQr,

    /** Check-in memakai token QR hasil pemindaian. */
    checkInByQr: (qrCode: string, paxActual?: number) =>
      checkInMutation.mutateAsync({
        qrCode,
        ...(paxActual ? { paxActual } : {}),
      }),
    /** Check-in manual memakai ID tamu dari tabel. */
    checkInByGuestId: (guestId: string, paxActual?: number) =>
      checkInMutation.mutateAsync({
        guestId,
        ...(paxActual ? { paxActual } : {}),
      }),
    /** Membatalkan kehadiran / check-out tamu. */
    checkOutByGuestId: (guestId: string) =>
      checkOutMutation.mutateAsync({ guestId }),

    isLoading: enabled && (guestsQuery.isLoading || statsQuery.isLoading),
    isError: guestsQuery.isError || statsQuery.isError,
    isMutating: checkInMutation.isPending || checkOutMutation.isPending,
    /** Pesan galat siap tampil dari backend (mis. "Tamu sudah check-in"). */
    mutationMessage:
      checkInMutation.error || checkOutMutation.error
        ? parseApiError(checkInMutation.error ?? checkOutMutation.error)
            .generalMessage
        : null,
  };
}
