import { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Smartphone,
  Monitor,
  ArrowRight,
  Heart,
  Calendar,
  MapPin,
  Clock,
  Volume2,
  VolumeX,
  Gift,
  Copy,
  Check,
  Send,
  QrCode,
} from "lucide-react";
import type { TemplateSlug } from "@/templates/template-registry";

interface LandingLiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateSlug?: TemplateSlug;
}

export function LandingLiveDemoModal({
  isOpen,
  onClose,
  initialTemplateSlug = "royal-floral",
}: LandingLiveDemoModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateSlug>(initialTemplateSlug);
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isCopiedRek, setIsCopiedRek] = useState(false);
  const [isRsvpSent, setIsRsvpSent] = useState(false);

  // Mock guest wishes state
  const [wishes, setWishes] = useState([
    {
      name: "Rizky & Amanda",
      relation: "Sahabat Kuliah",
      message: "Happy Wedding Dimas & Anindya! Semoga cinta kalian abadi hingga akhir hayat. Aamiin!",
      time: "2 menit lalu",
    },
    {
      name: "Keluarga Besar Bpk. Handoko",
      relation: "Kerabat Pengantin",
      message: "Selamat atas pernikahannya. Semoga senantiasa dilimpahi keberkahan dan kebahagiaan.",
      time: "10 menit lalu",
    },
  ]);
  const [newWishName, setNewWishName] = useState("");
  const [newWishMessage, setNewWishMessage] = useState("");

  if (!isOpen) return null;

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMessage.trim()) return;
    setWishes([
      {
        name: newWishName.trim(),
        relation: "Tamu Undangan",
        message: newWishMessage.trim(),
        time: "Baru saja",
      },
      ...wishes,
    ]);
    setNewWishName("");
    setNewWishMessage("");
  };

  const templateOptions: { slug: TemplateSlug; name: string }[] = [
    { slug: "royal-floral", name: "Royal Floral" },
    { slug: "javanese-classic", name: "Javanese Classic" },
    { slug: "modern-minimalist", name: "Modern Minimalist" },
    { slug: "khitanan-ceria-blue", name: "Khitanan Ceria" },
    { slug: "rasulan-syukuran-gold", name: "Rasulan Syukuran" },
    { slug: "aqiqah-lembut-mint", name: "Aqiqah Lembut" },
  ];

  // Theme styling presets for the simulated invitation
  const isDarkClassic = selectedTemplate === "javanese-classic";
  const isMinimal = selectedTemplate === "modern-minimalist";
  const isCeria = selectedTemplate === "khitanan-ceria-blue";
  const isSyukuran = selectedTemplate === "rasulan-syukuran-gold";
  const isAqiqah = selectedTemplate === "aqiqah-lembut-mint";

  const getThemeBg = () => {
    if (isDarkClassic) return "bg-slate-900 text-slate-100";
    if (isMinimal) return "bg-white text-slate-900";
    if (isCeria) return "bg-sky-50 text-slate-900";
    if (isSyukuran) return "bg-amber-50 text-stone-900";
    if (isAqiqah) return "bg-emerald-50 text-emerald-950";
    return "bg-[#FAF7F2] text-slate-900"; // Royal floral
  };

  const getThemeAccent = () => {
    if (isDarkClassic) return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    if (isMinimal) return "text-slate-900 bg-slate-100 border-slate-300";
    if (isCeria) return "text-sky-600 bg-sky-100 border-sky-300";
    if (isSyukuran) return "text-amber-700 bg-amber-100 border-amber-300";
    if (isAqiqah) return "text-emerald-700 bg-emerald-100 border-emerald-300";
    return "text-[#526B5D] bg-[#526B5D]/10 border-[#526B5D]/20";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-5xl h-[94vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Control Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Tema:
            </span>
            {templateOptions.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSelectedTemplate(t.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTemplate === t.slug
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switch (Mobile vs Desktop) */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "mobile"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan HP Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "desktop"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan Desktop / Tablet"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport Body */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-4 flex justify-center items-start">
          <div
            className={`w-full transition-all duration-300 ${
              viewMode === "mobile"
                ? "max-w-sm rounded-[36px] border-8 border-slate-800 shadow-2xl overflow-hidden"
                : "max-w-3xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
            } ${getThemeBg()}`}
          >
            {/* Floating Audio Play Bar inside demo */}
            <div className="sticky top-3 right-3 z-30 flex justify-end px-3">
              <button
                type="button"
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                {isMusicPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[10px] hidden sm:inline">Playing</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] hidden sm:inline">Music Off</span>
                  </>
                )}
              </button>
            </div>

            {/* DEMO INVITATION CONTENT */}
            <div className="p-4 sm:p-6 space-y-8">
              
              {/* Cover Hero */}
              <div className="text-center space-y-3 pt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${getThemeAccent()}`}>
                  The Wedding of
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  Dimas &amp; Anindya
                </h1>
                <p className="text-xs opacity-75 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Sabtu, 24 Oktober 2026
                </p>

                {/* Hero Couple Photo */}
                <div className="rounded-2xl overflow-hidden aspect-4/3 shadow-md border border-white/20 mt-4">
                  <img
                    src={
                      isDarkClassic
                        ? "/images/theme_classic.jpg"
                        : isMinimal
                        ? "/images/theme_modern.jpg"
                        : "/images/hero_wedding_couple.jpg"
                    }
                    alt="Demo Couple"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Personalized Guest Box */}
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xs text-center space-y-1 text-slate-900">
                <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </div>
                <div className="text-base font-bold font-display text-slate-900">
                  Bpk. Hendra Gunawan &amp; Partner
                </div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  VIP Guest • 2 Pax Undangan
                </div>
              </div>

              {/* Event Schedule Section */}
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-center">
                  Rangkaian Acara
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Akad Nikah */}
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xs text-slate-900 space-y-2">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">
                      Akad Nikah
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>08:00 - 10:00 WIB</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>Masjid Agung Al-Azhar, Jakarta Selatan</span>
                    </div>
                  </div>

                  {/* Resepsi */}
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xs text-slate-900 space-y-2">
                    <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                      Resepsi Pernikahan
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>11:00 - 14:00 WIB</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>Grand Ballroom Hotel Mulia, Jakarta</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Gift / Hadiah Rekening Box */}
              <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-slate-900 space-y-3">
                <div className="text-center">
                  <Gift className="w-6 h-6 text-primary mx-auto mb-1" />
                  <h3 className="font-display font-bold text-base">Amplop &amp; Hadiah Digital</h3>
                  <p className="text-xs text-slate-500">Kirimkan tanda kasih Anda secara instan dan aman</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">BCA - 8820 1938 4920</div>
                    <div className="text-[11px] text-slate-500">a.n Anindya Paramitha</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("882019384920");
                      setIsCopiedRek(true);
                      setTimeout(() => setIsCopiedRek(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedRek ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedRek ? "Disalin!" : "Salin"}</span>
                  </button>
                </div>
              </div>

              {/* Wishes & RSVP Form Box */}
              <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-slate-900 space-y-4">
                <div className="text-center">
                  <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1 fill-rose-500/20" />
                  <h3 className="font-display font-bold text-base">Kirim Doa &amp; Konfirmasi RSVP</h3>
                </div>

                {isRsvpSent ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-xs font-semibold">
                    ✓ Terima kasih! Konfirmasi kehadiran &amp; doa Anda telah tercatat.
                  </div>
                ) : (
                  <form onSubmit={handleAddWish} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Anda..."
                      value={newWishName}
                      onChange={(e) => setNewWishName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary bg-white"
                      required
                    />
                    <textarea
                      placeholder="Tuliskan ucapan dan doa restu..."
                      value={newWishMessage}
                      onChange={(e) => setNewWishMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary bg-white"
                      required
                    />
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRsvpSent(true)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✓ Konfirmasi Hadir
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Doa</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Wishes Feed */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700">
                    Ucapan Tamu ({wishes.length})
                  </div>
                  {wishes.map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{w.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{w.time}</span>
                      </div>
                      <p className="text-slate-600 italic">"{w.message}"</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400">
              Tema ini siap digunakan dan dapat diedit kapan saja.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Tutup Pratinjau
            </button>

            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Gunakan Tema Ini (Gratis)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
