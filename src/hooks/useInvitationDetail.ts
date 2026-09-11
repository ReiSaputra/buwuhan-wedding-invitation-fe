import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useMembers";
import type {
  ApiInvitation,
  GuestStatsApiData,
  RsvpStatsApiData,
} from "@/types/invitation-api";
import type { InvitationDetail, ActivityLog } from "@/types/dashboard";
import type { InvitationRole } from "@/types/member";

/**
 * Menyusun nama pasangan "Pria & Wanita" dari array couples backend.
 */
function buildCoupleName(couples: ApiInvitation["couples"]): string {
  const groom = couples.find((c) => c.type === "GROOM")?.name ?? "";
  const bride = couples.find((c) => c.type === "BRIDE")?.name ?? "";
  if (groom && bride) return `${groom} & ${bride}`;
  return groom || bride || "Tanpa Nama";
}

/**
 * Objek cadangan yang dipakai selama data belum selesai dimuat,
 * supaya komponen panel tidak perlu memeriksa null di mana-mana.
 */
const EMPTY_DETAIL: InvitationDetail = {
  id: "",
  slug: "",
  title: "",
  panelName: "Undangan",
  coupleName: "Undangan",
  eventDate: null,
  eventTime: null,
  venue: null,
  address: null,
  status: "DRAFT",
  guestCount: 0,
  confirmedCount: 0,
  checkedInCount: 0,
  buwuhTotal: 0,
};

/**
 * Custom React Hook untuk mengambil data detail sebuah undangan spesifik
 * beserta statistik tamu dan RSVP dari backend.
 *
 * Menggabungkan 3 endpoint yang dipanggil paralel:
 * - GET /invitations/:id
 * - GET /invitations/:id/guests/stats
 * - GET /invitations/:id/rsvps/stats
 *
 * @param id - Identifier unik undangan (cuid dari backend)
 */
export function useInvitationDetail(id: string) {
  const enabled = Boolean(id);

  const invitationQuery = useQuery({
    queryKey: ["invitation", id],
    queryFn: () => fetchData<ApiInvitation>(`/invitations/${id}`),
    enabled,
  });

  const guestStatsQuery = useQuery({
    queryKey: ["invitation", id, "guest-stats"],
    queryFn: () =>
      fetchData<GuestStatsApiData>(`/invitations/${id}/guests/stats`),
    enabled,
  });

  const rsvpStatsQuery = useQuery({
    queryKey: ["invitation", id, "rsvp-stats"],
    queryFn: () =>
      fetchData<RsvpStatsApiData>(`/invitations/${id}/rsvps/stats`),
    enabled,
  });

  const raw = invitationQuery.data;

  const invitation: InvitationDetail = raw
    ? {
        id: raw.id,
        slug: raw.slug,
        title: raw.title,
        panelName: raw.title,
        coupleName: buildCoupleName(raw.couples),
        eventDate: raw.eventDate ? raw.eventDate.slice(0, 10) : null,
        eventTime: raw.eventTime,
        venue: raw.venue,
        address: raw.address,
        status: raw.status,
        guestCount: guestStatsQuery.data?.totalGuests ?? 0,
        confirmedCount: rsvpStatsQuery.data?.totalConfirmed ?? 0,
        checkedInCount: guestStatsQuery.data?.totalAttended ?? 0,
        // Fitur buwuh/amplop digital belum ada di backend, jadi masih 0.
        buwuhTotal: 0,
      }
    : { ...EMPTY_DETAIL, id };

  // Backend belum menyediakan endpoint log aktivitas, jadi tetap kosong.
  const activities: ActivityLog[] = [];

  return {
    invitation,
    activities,
    isFound: Boolean(raw),
    rawInvitation: raw ?? null,
    isLoading:
      enabled &&
      (invitationQuery.isLoading ||
        guestStatsQuery.isLoading ||
        rsvpStatsQuery.isLoading),
    isError: invitationQuery.isError,
    error: invitationQuery.error,
  };
}

/**
 * Hook pembantu untuk memeriksa peran pengguna pada undangan yang sedang dibuka:
 * - OWNER: Pemilik akun yang membuat undangan (Akses Penuh)
 * - ADMIN: Co-host yang diundang (Bisa kelola tamu & konten, TIDAK bisa kelola member/hapus undangan)
 * - USER : Petugas penerima tamu (Hanya bisa lihat tamu & Scan QR presensi)
 */
export function useCurrentInvitationRole(invitationId: string) {
  const { user } = useAuth();
  const { invitation, isFound } = useInvitationDetail(invitationId);
  const { data: members = [] } = useMembers(invitationId);

  // Periksa apakah user yang sedang login adalah pemilik undangan atau terdaftar sebagai member
  const isOwner = Boolean(user && invitation && isFound && !members.some((m) => m.email.toLowerCase() === user.email.toLowerCase()));
  const myMember = members.find((m) => m.email.toLowerCase() === user?.email?.toLowerCase());

  const role: InvitationRole = isOwner ? "OWNER" : (myMember?.role ?? "USER");

  return {
    role,
    isOwner: role === "OWNER",
    canManageMembers: role === "OWNER",
    canEditContent: role === "OWNER" || role === "ADMIN",
    canManageGuests: role === "OWNER" || role === "ADMIN",
    canScanQr: true, // Seluruh role (OWNER, ADMIN, USER) berhak scan QR presensi
  };
}