import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah saya bisa mencoba membuat undangan secara gratis?",
      a: "Ya. Anda dapat mendaftar akun gratis, memilih tema desain, mengisi foto dan data acara, serta melihat tampilan undangan langsung secara cuma-cuma tanpa perlu memasukkan kartu kredit.",
    },
    {
      q: "Bagaimana cara kerja scan QR di meja penerima tamu?",
      a: "Setiap link undangan tamu otomatis dilengkapi dengan QR code unik. Di hari-H, Anda cukup membagikan Magic Link ke panitia resepsi. Panitia bisa langsung memindai QR code tamu menggunakan kamera browser HP tanpa perlu menginstal aplikasi tambahan.",
    },
    {
      q: "Apakah amplop digital dikenakan potongan biaya?",
      a: "Tidak ada potongan (0% komisi). Anda dapat mencantumkan nomor rekening bank pribadi maupun QRIS pribadi. Semua dana yang dikirim oleh tamu 100% langsung masuk ke rekening Anda.",
    },
    {
      q: "Apakah saya bisa mengubah data acara setelah undangan disebar?",
      a: "Bisa. Anda memiliki akses penuh kapan saja untuk mengedit jam acara, alamat, foto galeri, musik, atau bahkan mengganti tema. Link undangan yang sudah disebar ke tamu akan otomatis menampilkan data terbaru.",
    },
    {
      q: "Bagaimana cara menyebarkan undangan ke WhatsApp tamu?",
      a: "Anda cukup memasukkan daftar nama tamu (ketik langsung atau impor file Excel), lalu klik tombol kirim WhatsApp. Sistem sudah menyiapkan teks pesan dengan sapaan nama tamu yang dipersonalisasi.",
    },
    {
      q: "Apakah data rekap catatan buwuhan bisa diekspor?",
      a: "Ya, seluruh catatan amplop (nama pemberi, alamat asal, nominal uang, jenis bantuan fisik) dapat diunduh dalam format file Excel (.xlsx) dan CSV.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Jawaban untuk hal-hal yang sering ditanyakan seputar pembuatan undangan dan hari-H.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-slate-200 text-slate-900" : ""
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
