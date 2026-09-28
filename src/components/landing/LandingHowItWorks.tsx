import { Link } from "react-router-dom";
import { Palette, FileText, Share2, QrCode, ArrowRight } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Pilih Desain Tema",
      desc: "Pilih dari tema floral elegan, adat Jawa, minimalis, atau syukuran yang sesuai konsep pernikahan Anda.",
      icon: Palette,
    },
    {
      num: "2",
      title: "Isi Data & Galeri Foto",
      desc: "Lengkapi nama mempelai, jadwal akad & resepsi, tautan Google Maps, foto album, serta nomor rekening kado.",
      icon: FileText,
    },
    {
      num: "3",
      title: "Sebar via WhatsApp",
      desc: "Ketik atau impor nama tamu. Sistem menyiapkan pesan WA dengan sapaan nama tamu yang dipersonalisasi otomatis.",
      icon: Share2,
    },
    {
      num: "4",
      title: "Pakai di Hari-H Resepsi",
      desc: "Panitia cukup buka scanner kamera di HP untuk mencatat kehadiran tamu dan menginput catatan buwuhan/amplop.",
      icon: QrCode,
    },
  ];

  return (
    <section id="cara-kerja" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Cara membuat dan menggunakan undangan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Tidak butuh koding atau keahlian desain. Semua pengaturan sudah disediakan dalam form yang mudah dipahami.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        <div className="mt-10 text-center sm:text-left">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <span>Daftar akun gratis dan coba buat undangan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
