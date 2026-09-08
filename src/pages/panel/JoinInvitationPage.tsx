import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAcceptMemberInvite } from "@/hooks/useMembers";
import { parseApiError } from "@/lib/errorHandler";

type JoinStatus = "processing" | "success" | "error";

/**
 * Halaman tujuan tautan undangan petugas yang dikirim backend lewat email
 * (`buildAcceptUrl` di member.service.ts menghasilkan
 * `${FRONTEND_URL}/dashboard/undangan/join?token=...`).
 *
 * Catatan implementasi: seluruh setState HANYA dipanggil di dalam callback
 * asinkron setelah `await`, tidak pernah sinkron di badan efek. Kondisi
 * "token tidak ada pada URL" diturunkan langsung saat render sehingga tidak
 * memerlukan state sama sekali.
 */
export default function JoinInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { mutateAsync: acceptInvite } = useAcceptMemberInvite();

  const [status, setStatus] = useState<JoinStatus>("processing");
  const [message, setMessage] = useState("Memverifikasi undangan Anda...");

  // Mencegah pemanggilan ganda akibat StrictMode di mode pengembangan
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (hasRun.current) return;
    hasRun.current = true;

    let isMounted = true;

    void (async () => {
      try {
        const result = await acceptInvite(token);
        if (!isMounted) return;

        setStatus("success");
        setMessage(
          `Anda berhasil bergabung pada undangan "${result.invitationTitle}". Mengalihkan ke panel...`,
        );

        setTimeout(() => {
          navigate(`/dashboard/undangan/${result.invitationId}`, {
            replace: true,
          });
        }, 1800);
      } catch (err) {
        if (!isMounted) return;

        const parsed = parseApiError(err);
        setStatus("error");
        setMessage(
          parsed.generalMessage ??
            parsed.allMessages[0] ??
            "Gagal memproses undangan. Tautan mungkin sudah kedaluwarsa.",
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token, acceptInvite, navigate]);

  // Token tidak ada pada URL — diturunkan saat render, bukan lewat state
  if (!token) {
    return (
      <JoinShell
        icon={<XCircle size={40} className="text-red-500" />}
        title="Tautan Tidak Valid"
        description="Token undangan tidak ditemukan pada tautan. Silakan minta pemilik undangan mengirim ulang emailnya."
        showBackLink
      />
    );
  }

  if (status === "processing") {
    return (
      <JoinShell
        icon={<Loader2 size={40} className="animate-spin text-primary" />}
        title="Memproses Undangan"
        description={message}
      />
    );
  }

  if (status === "success") {
    return (
      <JoinShell
        icon={<CheckCircle2 size={40} className="text-emerald-500" />}
        title="Undangan Diterima"
        description={message}
      />
    );
  }

  return (
    <JoinShell
      icon={<XCircle size={40} className="text-red-500" />}
      title="Undangan Gagal Diproses"
      description={message}
      showBackLink
    />
  );
}

function JoinShell({
  icon,
  title,
  description,
  showBackLink = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  showBackLink?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-xs">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        {showBackLink && (
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            Kembali ke Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
