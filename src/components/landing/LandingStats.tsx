import { Smartphone, QrCode, FileSpreadsheet, Gift } from "lucide-react";

export function LandingStats() {
  const highlights = [
    {
      icon: Smartphone,
      title: "Ringan di Semua HP",
      desc: "Desain cepat dan nyaman dibuka tamu tanpa lemot.",
    },
    {
      icon: QrCode,
      title: "Check-in QR di Pintu Masuk",
      desc: "Petugas resepsi cukup scan via browser HP tanpa pasang aplikasi.",
    },
    {
      icon: FileSpreadsheet,
      title: "Catatan Buwuh & Amplop",
      desc: "Rekap data pemberi & nominal, bisa langsung diekspor ke Excel.",
    },
    {
      icon: Gift,
      title: "0% Potongan Hadiah",
      desc: "QRIS dan transfer bank langsung masuk ke rekening pribadi Anda.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-800 shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
