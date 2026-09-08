import { useState } from "react";
import { PlanCard } from "@/components/langganan/PlanCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePlans } from "@/hooks/usePlans";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlanCode, PlanTier } from "@/types/dashboard";
import type { UpgradeResponse } from "@/types/subscription";
import {
  formatDateId,
  formatNumber,
  formatRupiah,
  formatTimeWib,
} from "@/lib/format";
import {
  Sparkles,
  QrCode,
  CreditCard,
  ChevronDown,
  CheckCircle2,
  Receipt,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Apakah saya bisa mengubah atau upgrade paket kapan saja?",
    a: "Ya, Anda dapat melakukan upgrade atau perpanjangan paket langganan kapan saja. Fitur dan kuota tambahan akan langsung aktif seketika setelah pembayaran terverifikasi.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja, BCA Mobile), Transfer Bank Virtual Account (BCA, Mandiri, BNI, BRI), serta Kartu Kredit/Debit Visa & MasterCard.",
  },
  {
    q: "Apakah ada watermark pada paket berbayar (Pro/Max)?",
    a: "Tidak ada watermark sama sekali. Undangan Anda akan tampil 100% eksklusif dan bersih dengan merek dan nama mempelai Anda sendiri.",
  },
  {
    q: "Berapa lama masa aktif paket langganan?",
    a: "Paket Pro berlaku selama 3 bulan aktif untuk satu siklus acara pernikahan penuh, sedangkan Paket Max berlaku selama periode langganan aktif dengan kuota undangan tak terbatas.",
  },
];

/**
 * Halaman Manajemen & Pemilihan Paket Langganan Buwuh Platform.
 * Menyediakan informasi status paket aktif, katalog paket Free, Pro, dan Max,
 * alur upgrade pembayaran otomatis, serta riwayat faktur/invoice.
 */
export default function LanggananPage() {
  const user = useCurrentUser();
  const { plans, isLoading: isPlansLoading } = usePlans();
  const {
    subscription,
    invoices,
    upgradeSubscription,
    isUpgrading,
    isAwaitingPayment,
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<"plans" | "invoices">("plans");
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "QRIS" | "VA_BCA" | "VA_MANDIRI"
  >("QRIS");
  const [upgradeData, setUpgradeData] = useState<UpgradeResponse | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSuccessPaid, setIsSuccessPaid] = useState(false);

  const selectedPlan = plans.find((p) => p.code === selectedPlanCode);
  const currentPlanCode = subscription?.planTier || user.plan || "FREE";

  function handleSelectPlan(code: PlanCode) {
    if (code === currentPlanCode) return;
    setSelectedPlanCode(code);
    setUpgradeData(null);
    setIsSuccessPaid(false);
  }

  async function handleProceedPayment() {
    if (!selectedPlanCode) return;

    try {
      const res = await upgradeSubscription({
        planTier: selectedPlanCode,
        billingCycle: isYearly ? "YEARLY" : "MONTHLY",
        paymentMethod,
      });
      setUpgradeData(res);
    } catch {
      // Handled in hook
    }
  }

  async function handleCopy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  }

  function handleSimulateSuccess() {
    setIsSuccessPaid(true);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pt-2 pb-12 animate-in fade-in duration-300">
      {/* 1. Header & Status Paket Pengguna Saat Ini */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 border border-indigo-400/30">
                Paket Aktif Akun
              </span>
              <Badge
                variant={
                  currentPlanCode === "MAX"
                    ? "warning"
                    : currentPlanCode === "PRO"
                      ? "primary"
                      : "default"
                }
              >
                {currentPlanCode} TIER
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Buwuhan{" "}
              {currentPlanCode === "MAX"
                ? "Max Enterprise"
                : currentPlanCode === "PRO"
                  ? "Pro Wedding"
                  : "Free Starter"}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl leading-relaxed">
              {currentPlanCode === "FREE"
                ? "Anda sedang menggunakan versi dasar. Buka akses tanpa batas ke seluruh template, QR scanner resepsi, dan tanpa watermark."
                : `Paket aktif hingga ${subscription?.expiresAt ? formatDateId(subscription.expiresAt) : "3 Bulan ke Depan"}. Nikmati seluruh fitur eksklusif.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
                Batas Undangan
              </span>
              <p className="font-display text-lg font-bold text-white mt-0.5">
                {subscription?.limits?.maxInvitations
                  ? `${formatNumber(subscription.limits.maxInvitations)} Acara`
                  : "1 Undangan"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
                Kapasitas Tamu
              </span>
              <p className="font-display text-lg font-bold text-white mt-0.5">
                {currentPlanCode === "FREE" ? "50 Tamu" : "Unlimited"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigasi: Katalog Paket vs Riwayat Invoice */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "plans"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap size={16} />
            <span>Pilihan Paket Langganan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt size={16} />
            <span>Riwayat Tagihan & Invoice ({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PILIHAN PAKET & PRICING */}
      {activeTab === "plans" && (
        <div className="space-y-12">
          {/* Judul & Toggle Billing */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles size={13} className="text-amber-500" />
              <span>Investasi Terbaik untuk Momen Bahagia</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Pilih Paket Sesuai Kebutuhan Acaramu
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Tingkatkan paket untuk mendapatkan akses tak terbatas ke seluruh
              fitur premium Buwuhan.
            </p>

            {/* Toggle Bulanan / Tahunan */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                    !isYearly
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  Penagihan Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                    isYearly
                      ? "bg-white text-primary shadow-xs"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  <span>Tahunan</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    Hemat 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Kartu Paket Langganan */}
          {isPlansLoading ? (
            <div className="py-16 text-center text-xs text-muted">
              Memuat katalog paket...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              {plans.map((plan: PlanTier) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  isCurrent={plan.code === currentPlanCode}
                  isYearly={isYearly}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted max-w-lg mx-auto leading-relaxed">
            Harga sudah termasuk PPN. Layanan dapat dibatalkan atau dialihkan
            sewaktu-waktu tanpa biaya penalti tambahan.
          </p>

          {/* FAQ Accordion */}
          <div className="mx-auto max-w-3xl pt-8 border-t border-slate-200/80 space-y-6">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-ink">
                Pertanyaan yang Sering Diajukan
              </h3>
              <p className="mt-1 text-xs text-muted">
                Semua jawaban untuk pertanyaan seputar paket langganan
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-ink hover:text-primary transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "shrink-0 text-slate-400 transition-transform duration-200",
                          isOpen && "rotate-180 text-primary",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 px-4 sm:px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT TAGIHAN & INVOICE */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-ink">
                  Riwayat Pembayaran & Faktur
                </h3>
                <p className="text-xs text-muted">
                  Seluruh arsip transaksi pembelian paket pada akun Anda
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  Belum ada riwayat transaksi
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Ketika Anda melakukan upgrade ke paket Pro atau Max, faktur
                  bukti pembayaran otomatis tercatat di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="px-6 py-3.5 text-left">No. Faktur</th>
                      <th className="px-6 py-3.5 text-left">Paket</th>
                      <th className="px-6 py-3.5 text-left">Nominal</th>
                      <th className="px-6 py-3.5 text-left">Metode</th>
                      <th className="px-6 py-3.5 text-left">Tanggal</th>
                      <th className="px-6 py-3.5 text-left">Status</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="px-6 py-4 font-bold font-mono text-ink">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              inv.planTier === "MAX" ? "warning" : "primary"
                            }
                          >
                            {inv.planTier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-slate-800">
                          {formatRupiah(inv.amount)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {inv.paymentMethod || "QRIS"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{formatDateId(inv.createdAt)}</div>
                          <div className="text-[10px] text-slate-400">
                            {formatTimeWib(inv.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              inv.status === "PAID"
                                ? "success"
                                : inv.status === "PENDING"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {inv.status === "PAID"
                              ? "Lunas"
                              : inv.status === "PENDING"
                                ? "Menunggu"
                                : "Gagal"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download size={13} />}
                            disabled={!inv.downloadUrl}
                            onClick={() =>
                              inv.downloadUrl &&
                              window.open(inv.downloadUrl, "_blank", "noopener")
                            }
                          >
                            Unduh
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT / UPGRADE PAKET */}
      <Modal
        isOpen={Boolean(selectedPlanCode)}
        onClose={() => setSelectedPlanCode(null)}
        title={
          isSuccessPaid
            ? "Pembayaran Sukses!"
            : upgradeData
              ? "Instruksi Pembayaran"
              : `Upgrade ke Paket Buwuhan ${selectedPlan?.name}`
        }
        description={
          isSuccessPaid
            ? "Paket Anda telah aktif secara otomatis."
            : upgradeData
              ? `Selesaikan pembayaran sebelum batas waktu berakhir (${formatTimeWib(upgradeData.expiresAt)})`
              : "Selesaikan transaksi untuk membuka seluruh fitur premium tanpa batas"
        }
        maxWidth="md"
      >
        {isSuccessPaid ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">
                Selamat, Paket Telah Aktif!
              </p>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                Akun Anda kini telah ditingkatkan ke{" "}
                <strong>Paket {selectedPlan?.name}</strong>. Anda dapat langsung
                menggunakan semua fitur premium.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => setSelectedPlanCode(null)}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        ) : upgradeData ? (
          /* Tampilan Instruksi Pembayaran (QRIS / Virtual Account) */
          <div className="space-y-4">
            <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Tagihan ({upgradeData.invoiceNumber})
              </span>
              <p className="font-display text-2xl font-extrabold text-primary font-mono">
                {formatRupiah(upgradeData.amount)}
              </p>
            </div>
            {isAwaitingPayment && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs font-semibold text-sky-900">
                Menunggu konfirmasi pembayaran… Halaman ini akan otomatis
                diperbarui.
              </div>
            )}
            {paymentMethod === "QRIS" && upgradeData.qrCodeUrl ? (
              <div className="text-center space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                <img
                  src={upgradeData.qrCodeUrl}
                  alt="QRIS Pembayaran"
                  className="mx-auto h-48 w-48 rounded-xl border border-slate-100 p-1 shadow-2xs"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-ink flex items-center justify-center gap-1.5">
                    <QrCode size={14} className="text-primary" />
                    <span>Scan QRIS dengan Aplikasi Pembayaran Apapun</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin
                    Mandiri
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nomor Virtual Account{" "}
                  {paymentMethod === "VA_BCA" ? "BCA" : "Mandiri"}
                </span>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="font-display text-lg font-bold font-mono text-ink tracking-wider">
                    {upgradeData.virtualAccountNumber || "8801928374619283"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        upgradeData.virtualAccountNumber || "8801928374619283",
                        "va",
                      )
                    }
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    {copiedText === "va" ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedText === "va" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlanCode(null)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<ShieldCheck size={14} />}
                onClick={handleSimulateSuccess}
              >
                Saya Sudah Bayar (Konfirmasi)
              </Button>
            </div>
          </div>
        ) : (
          /* Form Pilih Metode Pembayaran */
          selectedPlan && (
            <div className="space-y-4">
              {/* Ringkasan Biaya */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Paket Pilihan</span>
                  <span className="font-bold text-ink">
                    Buwuhan {selectedPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Periode Tagihan</span>
                  <span className="font-semibold text-slate-800">
                    {isYearly ? "Tahunan (Hemat 20%)" : "Bulanan / Per Acara"}
                  </span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-ink">Total Tagihan</span>
                  <span className="font-display text-lg font-bold text-primary">
                    {formatRupiah(
                      isYearly
                        ? selectedPlan.price * 0.8 * 12
                        : selectedPlan.price,
                    )}
                  </span>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-ink">
                  Pilih Metode Pembayaran Otomatis:
                </p>
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold cursor-pointer transition ${
                      paymentMethod === "QRIS"
                        ? "border-primary bg-indigo-50/50 text-primary ring-2 ring-primary/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode size={18} />
                      <div>
                        <p className="font-bold">
                          QRIS Instan (Semua E-Wallet & M-Banking)
                        </p>
                        <p className="text-[10px] text-slate-500 font-normal">
                          GoPay, OVO, Dana, ShopeePay, BCA, Mandiri
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                      Instan
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("VA_BCA")}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold cursor-pointer transition ${
                      paymentMethod === "VA_BCA"
                        ? "border-primary bg-indigo-50/50 text-primary ring-2 ring-primary/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <div>
                        <p className="font-bold">BCA Virtual Account</p>
                        <p className="text-[10px] text-slate-500 font-normal">
                          Verifikasi otomatis 24 jam
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("VA_MANDIRI")}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold cursor-pointer transition ${
                      paymentMethod === "VA_MANDIRI"
                        ? "border-primary bg-indigo-50/50 text-primary ring-2 ring-primary/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <div>
                        <p className="font-bold">Mandiri Virtual Account</p>
                        <p className="text-[10px] text-slate-500 font-normal">
                          Verifikasi otomatis 24 jam
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlanCode(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isUpgrading}
                  onClick={handleProceedPayment}
                  icon={<Sparkles size={14} />}
                >
                  Lanjut Pembayaran
                </Button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
