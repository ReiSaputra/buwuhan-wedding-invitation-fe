import { useState } from 'react'
import { PlanCard } from '@/components/langganan/PlanCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePlans } from '@/hooks/usePlans'
import type { PlanCode, PlanTier } from '@/types/dashboard'
import { formatRupiah } from '@/lib/format'
import { Sparkles, QrCode, CreditCard, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const FAQS = [
  {
    q: 'Apakah saya bisa mengubah atau upgrade paket kapan saja?',
    a: 'Ya, Anda dapat melakukan upgrade atau downgrade paket langganan kapan saja. Masa aktif akan langsung disesuaikan secara proporsional.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Bank Virtual Account (BCA, Mandiri, BNI, BRI), serta Kartu Kredit/Debit.',
  },
  {
    q: 'Apakah ada watermark pada paket berbayar (Pro/Max)?',
    a: 'Tidak ada watermark. Undangan Anda akan tampil 100% eksklusif dan bersih dengan brand Anda sendiri.',
  },
]

/**
 * Halaman Pemilihan Paket Langganan Buwuh Panel.
 * Menyediakan opsi paket Free, Pro, dan Max, pengalih penagihan bulanan/tahunan,
 * simulasi modal checkout/pembayaran, serta daftar pertanyaan yang sering diajukan (FAQ).
 */
export default function LanggananPage() {
  const user = useCurrentUser()
  const { plans } = usePlans()
  const [isYearly, setIsYearly] = useState(false)
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const selectedPlan = plans.find((p) => p.code === selectedPlanCode)

  /**
   * Menangani pemilihan paket untuk membuka modal checkout.
   * 
   * @param code - Kode paket yang dipilih pengguna
   */
  function handleSelect(code: PlanCode) {
    setSelectedPlanCode(code)
    setIsSuccess(false)
  }

  /**
   * Menjalankan simulasi pembayaran checkout.
   */
  function handlePay() {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pt-4 pb-12 animate-in fade-in duration-300">
      {/* Header & Judul */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3.5 py-1 text-xs font-bold text-primary">
          <Sparkles size={13} className="text-amber-500" />
          <span>Investasi Terbaik untuk Momen Bahagia</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Pilih Paket Sesuai Kebutuhan Acaramu
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Mulai secara gratis atau buka semua fitur eksklusif tanpa batas untuk pernikahan impian Anda.
        </p>

        {/* Toggle Bulanan / Tahunan */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                'rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
                !isYearly ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-ink',
              )}
            >
              Penagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
                isYearly ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-ink',
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
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((plan: PlanTier) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            isCurrent={plan.code === user.plan}
            isYearly={isYearly}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted max-w-lg mx-auto leading-relaxed">
        Harga sudah termasuk pajak. Layanan dapat dibatalkan atau dialihkan sewaktu-waktu tanpa biaya tambahan.
      </p>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl pt-8 border-t border-slate-200/80 space-y-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Pertanyaan yang Sering Diajukan</h2>
          <p className="mt-1 text-xs text-muted">Semua jawaban untuk pertanyaan seputar paket Buwuhan</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index

            return (
              <div key={faq.q} className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-ink hover:text-primary transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={cn('shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-primary')}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 sm:px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Simulasi Checkout Paket */}
      <Modal
        isOpen={Boolean(selectedPlanCode)}
        onClose={() => setSelectedPlanCode(null)}
        icon={
          isSuccess ? (
            <CheckCircle2 size={22} className="text-emerald-600" />
          ) : (
            <Sparkles size={22} className="text-primary" />
          )
        }
        title={isSuccess ? 'Pembayaran Berhasil!' : `Upgrade ke Paket ${selectedPlan?.name}`}
        description={
          isSuccess
            ? 'Selamat, paket Anda telah aktif secara otomatis.'
            : 'Selesaikan transaksi untuk mengaktifkan seluruh fitur premium.'
        }
        maxWidth="md"
      >
        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">Terima Kasih!</p>
              <p className="mt-1 text-xs text-muted">
                Akun Anda sekarang telah menikmati fitur dari Paket {selectedPlan?.name}.
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
        ) : (
          selectedPlan && (
            <div className="space-y-4">
              {/* Ringkasan Biaya */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Paket Pilihan</span>
                  <span className="font-bold text-ink">Buwuh {selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Periode Tagihan</span>
                  <span className="font-semibold text-slate-800">{isYearly ? 'Tahunan (12 Bulan)' : 'Bulanan'}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-ink">Total Pembayaran</span>
                  <span className="font-display text-lg font-bold text-primary">
                    {formatRupiah(isYearly ? selectedPlan.price * 0.8 * 12 : selectedPlan.price)}
                  </span>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-ink">Pilih Metode Pembayaran:</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-primary bg-indigo-50/50 p-3 text-xs font-semibold text-primary cursor-pointer">
                    <input type="radio" name="payment_method" defaultChecked className="accent-indigo-600" />
                    <QrCode size={16} />
                    <span>QRIS Instan</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:border-slate-300 cursor-pointer">
                    <input type="radio" name="payment_method" className="accent-indigo-600" />
                    <CreditCard size={16} />
                    <span>Virtual Account</span>
                  </label>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPlanCode(null)}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handlePay}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  )
}