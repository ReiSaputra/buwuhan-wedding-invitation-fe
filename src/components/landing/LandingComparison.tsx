import { Check, X } from "lucide-react";

export function LandingComparison() {
  const comparisonItems = [
    {
      label: "Biaya & Efisiensi Budget",
      cetak: "Jutaan rupiah untuk cetak & kirim",
      biasa: "Rp 150rb – 300rb",
      buwuhan: "Mulai Gratis / Rp 49rb",
    },
    {
      label: "Revisi Data & Jadwal",
      cetak: "Tidak bisa jika sudah dicetak",
      biasa: "Terbatas / perlu hubungi admin",
      buwuhan: "Bebas edit kapan saja 24/7",
    },
    {
      label: "Scan QR Check-in di Meja Tamu",
      cetak: "Manual tulis buku tamu fisik",
      biasa: "Tidak tersedia",
      buwuhan: "Tersedia & realtime via kamera HP",
    },
    {
      label: "Catatan Buwuh / Amplop Tradisi",
      cetak: "Buku catatan tulis tangan",
      biasa: "Hanya nomor rekening statis",
      buwuhan: "Rekap amplop & ekspor Excel",
    },
    {
      label: "Akses Panitia Resepsi",
      cetak: "Koordinasi manual",
      biasa: "Harus buat akun",
      buwuhan: "Magic Link instan tanpa akun",
    },
    {
      label: "Sebar Undangan WhatsApp",
      cetak: "Kirim fisik / pos",
      biasa: "Copy-paste teks manual",
      buwuhan: "Nama tamu otomatis terisi di WA",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Perbandingan fitur undangan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Lihat bagaimana Buwuhan membantu menghemat biaya sekaligus membuat pengelolaan tamu resepsi lebih teratur.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-4 font-semibold w-1/3">Kebutuhan Acara</th>
                <th className="p-4 font-medium text-slate-500 text-center w-1/5">Undangan Cetak</th>
                <th className="p-4 font-medium text-slate-500 text-center w-1/5">Web Undangan Biasa</th>
                <th className="p-4 font-bold text-slate-900 bg-slate-100/80 text-center w-1/4 border-l border-slate-200">
                  Buwuhan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{item.label}</td>
                  <td className="p-4 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.cetak}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-slate-500">
                    <span>{item.biasa}</span>
                  </td>
                  <td className="p-4 text-center font-semibold text-slate-900 bg-slate-50/40 border-l border-slate-200">
                    <div className="flex items-center justify-center gap-1.5 text-primary">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item.buwuhan}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
