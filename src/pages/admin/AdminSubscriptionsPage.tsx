import { useState } from "react";
import { CreditCard, AlertTriangle } from "lucide-react";
import {
  useAdminSubscriptions,
  useOverrideSubscriptionStatus,
} from "@/hooks/useAdmin";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { QueryState } from "@/components/common/QueryState";
import { parseApiError } from "@/lib/errorHandler";
import type { SubscriptionStatus } from "@/types/admin";

const STATUS_OPTIONS: SubscriptionStatus[] = [
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
];

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Halaman Superadmin untuk memantau dan mengoreksi status langganan
 * seluruh pengguna platform.
 */
export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">(
    "ALL",
  );
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminSubscriptions({
    page,
    status: statusFilter,
  });
  const { mutateAsync: overrideStatus, isPending } =
    useOverrideSubscriptionStatus();

  async function handleChangeStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
  ) {
    if (!window.confirm(`Ubah status langganan ini menjadi ${status}?`)) return;
    setError(null);
    try {
      await overrideStatus({ subscriptionId, status });
    } catch (err) {
      const parsed = parseApiError(err);
      setError(
        parsed.generalMessage ??
          parsed.allMessages[0] ??
          "Gagal mengubah status langganan",
      );
    }
  }

  const subscriptions = data?.subscriptions ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <CreditCard className="text-primary" />
          <span>Manajemen Langganan</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pantau seluruh langganan pengguna dan koreksi status secara manual
          bila pembayaran bermasalah.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === "ALL"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <QueryState isLoading={isLoading} isError={isError}>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Pengguna</th>
                  <th className="px-4 py-3.5">Paket</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Mulai</th>
                  <th className="px-4 py-3.5">Berakhir</th>
                  <th className="px-4 py-3.5 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-xs text-muted"
                    >
                      Belum ada langganan yang cocok dengan filter ini.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-ink">
                          {sub.user.fullName}
                        </div>
                        <div className="text-xs text-muted">
                          {sub.user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-ink">
                          {sub.plan.name}
                        </div>
                        <div className="text-xs text-muted">
                          {formatRupiah(sub.plan.price)} / {sub.plan.period}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="default"
                          className={STATUS_STYLE[sub.status]}
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {formatDate(sub.startedAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        {formatDate(sub.expiresAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          disabled={isPending}
                          value={sub.status}
                          onChange={(e) =>
                            handleChangeStatus(
                              sub.id,
                              e.target.value as SubscriptionStatus,
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
}
