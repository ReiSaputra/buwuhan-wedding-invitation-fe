import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { parseApiError } from "@/lib/errorHandler";
import { useInvitationDetail, useCurrentInvitationRole } from "@/hooks/useInvitationDetail";
import {
  useMembers,
  useMemberDetail,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useResendMemberInvite,
  useGenerateInstantLink,
  type InstantLinkResult,
} from "@/hooks/useMembers";
import { Link2, Copy, Check } from "lucide-react";
import { getMemberStatus } from "@/types/member";
import type {
  Member,
  InvitationRole,
  CreateMemberPayload,
} from "@/types/member";
import {
  Users,
  UserPlus,
  QrCode,
  DollarSign,
  ShieldCheck,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Clock,
  Send,
  X,
  Loader2,
} from "lucide-react";

/**
 * Peran anggota undangan. Nilainya HARUS sama dengan enum InvitationRole
 * di backend (OWNER | ADMIN | USER) — backend tidak mengenal SCANNER,
 * RECEPTIONIST, CASHIER, maupun COORDINATOR.
 */
const ROLE_LABELS: Record<
  InvitationRole,
  { label: string; desc: string; icon: typeof Users; color: string }
> = {
  OWNER: {
    label: "Pemilik Undangan",
    desc: "Akses penuh, termasuk mengundang petugas dan menghapus undangan",
    icon: ShieldCheck,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ADMIN: {
    label: "Co-host",
    desc: "Mengelola tamu, RSVP, buwuh, galeri, dan pengaturan undangan",
    icon: ShieldCheck,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  USER: {
    label: "Petugas Penerima Tamu",
    desc: "Scan QR tiket tamu dan mencatat kehadiran di lokasi acara",
    icon: QrCode,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

/** Peran yang boleh diberikan lewat UI. OWNER tidak bisa dialihkan. */
const ASSIGNABLE_ROLES: InvitationRole[] = ["ADMIN", "USER"];

/**
 * Halaman Manajemen Petugas & Hak Akses Undangan (PanelPetugasPage).
 * Terhubung ke modul `member` di backend melalui hook useMembers.
 */
export default function PanelPetugasPage() {
  const { id = "" } = useParams();
  const { invitation } = useInvitationDetail(id);
  const { canManageMembers } = useCurrentInvitationRole(id);
  const { data: staffs = [], isLoading, isError } = useMembers(id);
  const { mutateAsync: addStaff, isPending: isAdding } = useInviteMember(id);
  const { mutateAsync: updateStaff, isPending: isUpdating } =
    useUpdateMemberRole(id);
  const { mutateAsync: deleteStaff, isPending: isDeletingStaff } = useRemoveMember(id);
  const { mutateAsync: resendInvite, isPending: isResending } =
    useResendMemberInvite(id);
  const { mutateAsync: generateInstantLink, isPending: isGeneratingLink } =
    useGenerateInstantLink(id);

  const [inviteMethod, setInviteMethod] = useState<"email" | "instant">("email");
  const [generatedLinkData, setGeneratedLinkData] = useState<InstantLinkResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Member | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Member | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedDetailMemberId, setSelectedDetailMemberId] = useState<string | null>(null);

  // Form State — backend member tidak menyimpan nomor telepon
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("USER");

  function openAddModal() {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setRole("USER");
    setInviteMethod("email");
    setGeneratedLinkData(null);
    setCopiedLink(false);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(staff: Member) {
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setRole(staff.role);
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError("Nama petugas wajib diisi");
      return;
    }
    if (inviteMethod === "email" && (!email.trim() || !email.includes("@"))) {
      setModalError("Masukkan alamat email petugas yang valid");
      return;
    }

    try {
      if (editingStaff) {
        // Backend hanya mendukung perubahan peran (PATCH .../members/:id)
        await updateStaff({ memberId: editingStaff.id, role });
        setIsModalOpen(false);
      } else if (inviteMethod === "instant") {
        const res = await generateInstantLink({
          name: name.trim(),
          role: "USER",
        });
        setGeneratedLinkData(res);
        setToast(`Tautan akses cepat untuk ${name.trim()} berhasil dibuat!`);
        setTimeout(() => setToast(null), 5000);
      } else {
        const payload: CreateMemberPayload = {
          name: name.trim(),
          email: email.trim(),
          role,
        };
        await addStaff(payload);
        setToast(`Email undangan telah dikirim ke ${email.trim()}`);
        setTimeout(() => setToast(null), 5000);
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      setModalError((err as Error)?.message || "Gagal menyimpan data petugas");
    }
  }



  /**
   * Backend tidak pernah mengirim token undangan ke frontend (token hanya
   * disimpan dalam bentuk hash dan dikirim lewat email), sehingga tautan
   * undangan tidak mungkin dibentuk di sisi klien. Satu-satunya cara adalah
   * meminta backend mengirim ulang emailnya.
   */
  async function handleResend(staff: Member) {
    try {
      await resendInvite(staff.id);
      setToast(`Email undangan berhasil dikirim ulang ke ${staff.email}`);
      setTimeout(() => setToast(null), 5000);
    } catch (err: unknown) {
      alert((err as Error)?.message || "Gagal mengirim ulang undangan");
    }
  }

  const filteredStaffs = staffs.filter((s) => {
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" || s.role === roleFilter;
    return matchQuery && matchRole;
  });

  const totalScanners = staffs.filter((s) => s.role === "USER").length;
  const totalCashiers = staffs.filter((s) => s.role === "ADMIN").length;
  const totalActive = staffs.filter(
    (s) => getMemberStatus(s) === "ACTIVE",
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: "Beranda", to: "/dashboard" },
          {
            label: `Panel ${invitation.coupleName || invitation.panelName}`,
            to: `/dashboard/undangan/${id}`,
          },
          { label: "Petugas & Panitia" },
        ]}
      />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <Users className="text-primary" />
            <span>Petugas & Hak Akses Panitia</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Undang co-host dan petugas penerima tamu lewat email untuk acara{" "}
            {invitation.coupleName}.
          </p>
        </div>

        {canManageMembers && (
          <Button
            variant="primary"
            size="md"
            onClick={openAddModal}
            icon={<UserPlus size={16} />}
          >
            Tambah Petugas
          </Button>
        )}
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Petugas
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">
            {staffs.length} Orang
          </strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Sudah Aktif
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-emerald-600">
            {totalActive} Orang
          </strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Petugas Lapangan
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <QrCode size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">
            {totalScanners} Orang
          </strong>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Co-host
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <DollarSign size={16} />
            </div>
          </div>
          <strong className="mt-2 block text-xl font-bold text-ink">
            {totalCashiers} Orang
          </strong>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email petugas..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setRoleFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                roleFilter === "ALL"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({staffs.length})
            </button>
            {ASSIGNABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                  roleFilter === r
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ROLE_LABELS[r]?.label.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Petugas */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Petugas</th>
                <th className="px-4 py-3.5">Peran & Tanggung Jawab</th>
                <th className="px-4 py-3.5">Diundang</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted text-xs"
                  >
                    <Loader2
                      size={18}
                      className="mx-auto animate-spin text-primary"
                    />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-red-600 text-xs"
                  >
                    Gagal memuat daftar petugas dari server.
                  </td>
                </tr>
              ) : filteredStaffs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted text-xs"
                  >
                    Belum ada petugas yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredStaffs.map((staff) => {
                  const roleConfig =
                    ROLE_LABELS[staff.role] || ROLE_LABELS.USER;
                  const memberStatus = getMemberStatus(staff);
                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailMemberId(staff.id)}
                          className="font-bold text-ink hover:text-primary transition text-left cursor-pointer"
                        >
                          {staff.name}
                        </button>
                        <div className="text-xs text-muted">{staff.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${roleConfig.color}`}
                        >
                          <roleConfig.icon size={13} />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-muted">
                          {new Date(staff.invitedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {memberStatus === "ACTIVE" ? (
                          <Badge
                            variant="primary"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <CheckCircle2 size={11} className="mr-1 inline" />{" "}
                            Aktif
                          </Badge>
                        ) : memberStatus === "PENDING" ? (
                          <Badge
                            variant="default"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            <Clock size={11} className="mr-1 inline" /> Menunggu
                            Buka Tautan
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-slate-100 text-slate-500"
                          >
                            Dicabut
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {canManageMembers ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {memberStatus === "PENDING" && (
                              <button
                                type="button"
                                disabled={isResending}
                                onClick={() => handleResend(staff)}
                                title="Kirim ulang email undangan"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                              >
                                {isResending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditModal(staff)}
                              title="Ubah Peran"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ink transition cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingStaff(staff)}
                              title="Cabut Akses"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Hanya Lihat</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT PETUGAS */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Users size={18} className="text-primary" />
                <span>
                  {editingStaff ? "Ubah Peran Petugas" : "Tambah Petugas Baru"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

                        {generatedLinkData ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Tautan Magic Link Siap Dibagikan</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">
                    Petugas <strong>{generatedLinkData.name}</strong> dapat langsung bertugas dengan membuka tautan ini tanpa perlu mendaftar akun.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Tautan Akses Cepat</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLinkData.accessLink}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 font-mono select-all focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLinkData.accessLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      icon={copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    >
                      {copiedLink ? "Disalin" : "Salin"}
                    </Button>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    Berlaku 30 hari. Bagikan tautan ini ke petugas melalui WhatsApp.
                  </p>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                {modalError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                    {modalError}
                  </div>
                )}

                {/* Tab Pilihan Metode Undangan (Hanya saat Tambah Baru) */}
                {!editingStaff && (
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => setInviteMethod("email")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        inviteMethod === "email"
                          ? "border-primary bg-indigo-50/50 text-primary"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Send size={14} />
                      <span>Kirim Undangan Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteMethod("instant")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        inviteMethod === "instant"
                          ? "border-primary bg-indigo-50/50 text-primary"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Link2 size={14} />
                      <span>Magic Link (Instan)</span>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Nama Petugas
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled={Boolean(editingStaff)}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    required
                  />
                </div>

                {inviteMethod === "email" && (
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled={Boolean(editingStaff)}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ahmad@example.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                      required
                    />
                  </div>
                )}

                {inviteMethod === "email" || editingStaff ? (
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Pilih Peran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASSIGNABLE_ROLES.map((r) => {
                        const cfg = ROLE_LABELS[r];
                        const isSelected = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                              isSelected
                                ? "border-primary bg-indigo-50/50 ring-1 ring-primary"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
                              <cfg.icon
                                size={14}
                                className={
                                  isSelected ? "text-primary" : "text-slate-500"
                                }
                              />
                              <span>{cfg.label.split(" (")[0]}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted line-clamp-2">
                              {cfg.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-primary">
                      <QrCode size={14} />
                      <span>Peran: Petugas Pencatat Buwuh (USER)</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Hak akses otomatis dikunci untuk modul Catatan Buwuh pada acara ini demi keamanan data acara Anda.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 text-[11px] text-sky-800">
                  {inviteMethod === "instant"
                    ? "Sistem akan membuat tautan unik (Magic Link) yang langsung memberikan akses pencatatan buwuh tanpa mewajibkan petugas membuat akun."
                    : "Sistem otomatis mengirim email undangan berisi tautan aktivasi yang berlaku 7 hari."}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isAdding || isUpdating || isGeneratingLink}
                  >
                    {isAdding || isUpdating || isGeneratingLink ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Menyimpan...
                      </span>
                    ) : editingStaff ? (
                      "Simpan Perubahan"
                    ) : inviteMethod === "instant" ? (
                      "Buat Magic Link"
                    ) : (
                      "Kirim Undangan"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI CABUT AKSES PETUGAS                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deletingStaff !== null}
        onClose={() => setDeletingStaff(null)}
        title="Cabut Hak Akses Petugas?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-950">
                Konfirmasi Pencabutan Akses
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                Yakin ingin mencabut akses untuk <strong>"{deletingStaff?.name}"</strong>? Petugas ini tidak akan dapat lagi masuk ke panel atau mencatat bantuan tamu.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingStaff(null)}
              disabled={isDeletingStaff}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeletingStaff}
              onClick={async () => {
                if (deletingStaff) {
                  try {
                    await deleteStaff(deletingStaff.id);
                    setToast(`Akses untuk ${deletingStaff.name} berhasil dicabut`);
                    setTimeout(() => setToast(null), 4000);
                    setDeletingStaff(null);
                  } catch (err: unknown) {
                    const parsed = parseApiError(err);
                    alert(parsed.generalMessage || "Gagal mencabut akses petugas");
                  }
                }
              }}
            >
              {isDeletingStaff ? "Mencabut…" : "Ya, Cabut Akses"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL DETAIL INFORMASI PETUGAS (GET /invitations/:id/members/:memberId)   */}
      {/* ========================================================================= */}
      {selectedDetailMemberId && (
        <MemberDetailModal
          invitationId={id}
          memberId={selectedDetailMemberId}
          onClose={() => setSelectedDetailMemberId(null)}
        />
      )}
    </div>
  );
}

/**
 * Komponen modal untuk menampilkan rincian audit satu petugas spesifik.
 * Memanggil endpoint: GET /invitations/:invitationId/members/:id
 */
function MemberDetailModal({
  invitationId,
  memberId,
  onClose,
}: {
  invitationId: string;
  memberId: string;
  onClose: () => void;
}) {
  const { data: member, isLoading } = useMemberDetail(invitationId, memberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-ink">
            <Users size={16} className="text-primary" />
            <h3 className="text-sm">Rincian Akses Petugas</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted flex justify-center items-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>Mengambil data dari server...</span>
          </div>
        ) : member ? (
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Lengkap</span>
              <p className="font-semibold text-ink text-sm">{member.name}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat Email</span>
              <p className="text-slate-700">{member.email}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tingkat Peran</span>
              <p className="font-semibold text-primary">{ROLE_LABELS[member.role]?.label || member.role}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-500 text-[11px]">
              <p>📅 <strong>Waktu Diundang:</strong> {new Date(member.invitedAt).toLocaleString("id-ID")}</p>
              <p>
                ✅ <strong>Status Aktivasi:</strong>{" "}
                {member.acceptedAt ? (
                  <span className="text-emerald-600 font-semibold">
                    Diterima ({new Date(member.acceptedAt).toLocaleString("id-ID")})
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">Menunggu buka tautan email</span>
                )}
              </p>
              {member.revokedAt && (
                <p className="text-rose-600 font-semibold">
                  ⛔ <strong>Akses Dicabut:</strong> {new Date(member.revokedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            <div className="pt-3 text-right">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-rose-600">
            Data petugas tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
