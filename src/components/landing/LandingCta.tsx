import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface LandingCtaProps {
  onOpenDemo: () => void;
}

export function LandingCta({ onOpenDemo }: LandingCtaProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Box */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-4">
            Mulai buat undangan digital Anda sekarang.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
            Daftar gratis untuk mencoba seluruh fitur dasar. Atur jadwal acara, pilih tema favorit, dan buat link WhatsApp tamu dalam hitungan menit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Daftar Akun Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Lihat Contoh Desain
            </button>
          </div>

          <div className="mt-8 text-xs text-slate-400">
            Tanpa perlu kartu kredit • Bisa langsung dicoba di browser
          </div>
        </div>

      </div>
    </section>
  );
}
