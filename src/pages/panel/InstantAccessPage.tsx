import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useInstantMemberAccess } from "@/hooks/useMembers";
import { useAuth } from "@/hooks/useAuth";
import { parseApiError } from "@/lib/errorHandler";

/**
 * Halaman penukaran Magic Link Petugas Instan (POST /api/members/instant-access).
 * Mengubah token query string menjadi session JWT dan mengarahkan petugas langsung ke panel scan QR.
 */
export default function InstantAccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { mutateAsync: redeemToken } = useInstantMemberAccess();
  const { setAuthSession } = useAuth();

    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Memverifikasi token akses petugas...");

  useEffect(() => {
    if (!token) return;
    const currentToken = token;
    let isCancelled = false;

    async function handleRedeem() {
      try {
        const result = await redeemToken(currentToken);
        if (isCancelled) return;

        // 1. Simpan token & identitas petugas ke LocalStorage & AuthContext
        localStorage.setItem("buwuhan_current_member_id", result.member.id);
        localStorage.setItem("buwuhan_current_member_name", result.member.name);

        setAuthSession(result.sessionToken, {
          id: result.member.id,
          fullName: result.member.name,
          email: "",
          role: result.member.role === "ADMIN" ? "ADMIN" : "USER",
          plan: "FREE",
        });

        setStatus("success");
        setMessage(
          `Selamat datang, ${result.member.name}! Anda terhubung sebagai ${result.member.role} untuk acara "${result.invitation.title}". Mengalihkan ke catatan buwuh...`,
        );

        // 2. Arahkan langsung ke panel catatan buwuh
        setTimeout(() => {
          navigate(`/dashboard/undangan/${result.invitation.id}/catatan-buwuh`, {
            replace: true,
          });
        }, 1000);
      } catch (err) {
        if (isCancelled) return;
        const parsed = parseApiError(err);
        setStatus("error");
        setMessage(
          parsed.generalMessage || "Token akses tidak valid atau sudah kedaluwarsa.",
        );
      }
    }

    void handleRedeem();

    return () => {
      isCancelled = true;
    };
  }, [token, redeemToken, setAuthSession, navigate]);

  if (!token) {
    return (
      <AccessShell
        icon={<XCircle size={44} className="text-red-500" />}
        title="Tautan Tidak Valid"
        description="Token akses petugas tidak ditemukan pada URL. Silakan minta tautan baru dari pemilik acara."
      />
    );
  }

  if (status === "processing") {
    return (
      <AccessShell
        icon={<Loader2 size={44} className="animate-spin text-primary" />}
        title="Menyiapkan Akses Petugas"
        description={message}
      />
    );
  }

  if (status === "success") {
    return (
      <AccessShell
        icon={<CheckCircle2 size={44} className="text-emerald-500" />}
        title="Akses Diterima!"
        description={message}
      />
    );
  }

  return (
    <AccessShell
      icon={<XCircle size={44} className="text-red-500" />}
      title="Akses Ditolak"
      description={message}
    />
  );
}

function AccessShell({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-white shadow-2xl">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="font-display text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <Link
            to="/login"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Masuk dengan Akun Utama &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}