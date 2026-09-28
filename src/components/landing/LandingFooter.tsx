import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo variant="light" size="md" showTagline={true} />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Aplikasi undangan digital pernikahan, live scan QR check-in tamu,
              dan pencatatan buwuhan / amplop otomatis di Indonesia.
            </p>
          </div>

          {/* Fitur */}
          <div className="space-y-2.5">
            <div className="font-semibold text-xs text-white uppercase tracking-wider">
              Fitur Unggulan
            </div>
            <ul className="space-y-2 text-xs">
              <li><a href="#fitur" className="hover:text-white transition-colors">Scan QR Check-in</a></li>
              <li><a href="#fitur" className="hover:text-white transition-colors">Catatan Buwuh &amp; Amplop</a></li>
              <li><a href="#fitur" className="hover:text-white transition-colors">Amplop Digital QRIS</a></li>
              <li><a href="#fitur" className="hover:text-white transition-colors">Buku Tamu &amp; Doa Real-time</a></li>
              <li><a href="#fitur" className="hover:text-white transition-colors">Magic Link Panitia</a></li>
            </ul>
          </div>

          {/* Akun & Navigasi */}
          <div className="space-y-2.5">
            <div className="font-semibold text-xs text-white uppercase tracking-wider">
              Akun &amp; Bantuan
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Masuk ke Akun</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Daftar Akun Baru</Link></li>
              <li><a href="#cara-kerja" className="hover:text-white transition-colors">Panduan Cara Pakai</a></li>
              <li><a href="#harga" className="hover:text-white transition-colors">Paket &amp; Harga</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} buwuh.com. Seluruh hak cipta dilindungi.
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Kembali ke atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
