import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      code: "FREE",
      name: "Free",
      tagline: "Coba buat undangan dan pelajari fiturnya secara gratis.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      isPopular: false,
      features: [
        "1 undangan aktif",
        "Maksimal 50 tamu",
        "10 foto galeri",
        "Kehadiran & buku ucapan dasar",
        "Watermark Buwuhan",
      ],
      ctaLabel: "Mulai Gratis",
      ctaLink: "/register",
    },
    {
      code: "PRO",
      name: "Pro",
      tagline: "Lengkap untuk satu acara pernikahan penuh.",
      monthlyPrice: 49000,
      yearlyPrice: 39000,
      isPopular: true,
      features: [
        "3 undangan aktif",
        "Tamu tanpa batas",
        "100 foto & video galeri",
        "Scan QR check-in meja resepsi",
        "3 akses panitia penerima tamu",
        "Bebas watermark (Whitelabel)",
        "Catatan buwuh & ekspor Excel",
      ],
      ctaLabel: "Pilih Paket Pro",
      ctaLink: "/register?plan=PRO",
    },
    {
      code: "MAX",
      name: "Max",
      tagline: "Untuk Wedding Organizer dan vendor pengelola banyak acara.",
      monthlyPrice: 149000,
      yearlyPrice: 119000,
      isPopular: false,
      features: [
        "Undangan aktif tanpa batas",
        "Tamu tanpa batas",
        "Galeri media tanpa batas",
        "Dukungan Custom Domain sendiri",
        "Akses panitia resepsi tanpa batas",
        "Semua template desain premium",
        "Bantuan prioritas via WhatsApp",
      ],
      ctaLabel: "Pilih Paket Max",
      ctaLink: "/register?plan=MAX",
    },
  ];

  return (
    <section id="harga" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Paket &amp; Harga Transparan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Tidak ada biaya tersembunyi. Bayar sekali untuk satu siklus acara atau pilih langganan tahunan untuk vendor.
          </p>

          {/* Billing Switch */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl bg-slate-200/80">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !isYearly ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sekali Bayar / Acara
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isYearly ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Langganan Tahunan</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.code}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-white border transition-shadow ${
                  plan.isPopular
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : "border-slate-200 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-xl text-slate-900">
                      {plan.name}
                    </h3>
                    {plan.isPopular && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                        Paling Dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
                        {price === 0 ? "Rp 0" : formatRupiah(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-slate-400">
                          {isYearly ? "/ bulan (tagihan tahunan)" : "/ acara"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 mb-8">
                    <div className="text-xs font-semibold text-slate-800">
                      Fitur yang disertakan:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={plan.ctaLink}
                  className={`w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    plan.isPopular
                      ? "bg-primary hover:bg-primary-hover text-white shadow-xs"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
