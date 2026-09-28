import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";

interface LandingHeroProps {
  onOpenDemo: () => void;
}

export function LandingHero({ onOpenDemo }: LandingHeroProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 35,
    seconds: 42,
  });

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Authentic Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Main Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[52px] text-slate-900 tracking-tight leading-[1.15] mb-5">
              Undangan digital elegan, buku tamu, dan rekap buwuhan dalam satu tempat.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
              Buat undangan web yang ringan dan nyaman dibuka di HP tamu. Dilengkapi
              scan QR code untuk penerima tamu di pintu masuk, amplop digital tanpa potongan,
              dan buku catatan buwuh yang langsung tersusun rapi.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
              <Link
                to="/register"
                id="hero-btn-primary"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Mulai Buat Undangan (Gratis)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={onOpenDemo}
                id="hero-btn-demo"
                className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Lihat Contoh Desain
              </button>
            </div>

            {/* Grounded Key Features List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs font-medium text-slate-600 pt-6 border-t border-slate-200 w-full text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bisa coba gratis dulu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Scan QR tamu di hari-H</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rekap amplop ke Excel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kirim WA nama tamu otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Akses panitia via Magic Link</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bebas watermark di paket Pro</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Realistic Mobile Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 shadow-xl border border-slate-800">
              
              {/* Phone Inner Container */}
              <div className="bg-[#FAF7F2] rounded-[28px] overflow-hidden text-slate-900 flex flex-col justify-between select-none border border-slate-200">
                
                {/* Header Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-200">
                  <img
                    src="/images/hero_wedding_couple.jpg"
                    alt="Pratinjau Pasangan Mempelai"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Top Bar inside phone */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-white bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                      The Wedding
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                      className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer"
                      title="Musik"
                    >
                      {isPlayingMusic ? (
                        <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Names on Cover */}
                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <h2 className="font-display font-bold text-xl text-white">
                      Dimas &amp; Anindya
                    </h2>
                    <p className="text-[11px] text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Sabtu, 24 Oktober 2026
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-3.5 space-y-3">
                  
                  {/* Countdown Box */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-medium text-center mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Hitung Mundur Acara</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div className="p-1 rounded-md bg-slate-50">
                        <div className="text-xs font-bold text-slate-900">{timeLeft.days}</div>
                        <div className="text-[9px] text-slate-400">Hari</div>
                      </div>
                      <div className="p-1 rounded-md bg-slate-50">
                        <div className="text-xs font-bold text-slate-900">{timeLeft.hours}</div>
                        <div className="text-[9px] text-slate-400">Jam</div>
                      </div>
                      <div className="p-1 rounded-md bg-slate-50">
                        <div className="text-xs font-bold text-slate-900">{timeLeft.minutes}</div>
                        <div className="text-[9px] text-slate-400">Menit</div>
                      </div>
                      <div className="p-1 rounded-md bg-slate-50">
                        <div className="text-xs font-bold text-primary">{timeLeft.seconds}</div>
                        <div className="text-[9px] text-slate-400">Detik</div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Name & QR Badge */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Undangan Khusus:</div>
                      <div className="text-xs font-bold text-slate-900">Bpk. Hendra Gunawan</div>
                      <div className="text-[10px] text-emerald-600 font-medium">✓ Konfirmasi Hadir (2 Orang)</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Buka Undangan Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
