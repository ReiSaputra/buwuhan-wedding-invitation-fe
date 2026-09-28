import { useState } from "react";
import {
  QrCode,
  Gift,
  Heart,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  ScanLine,
  Copy,
  Check,
  Globe,
} from "lucide-react";

export function LandingFeatures() {
  const [activeTab, setActiveTab] = useState<
    "qr-checkin" | "buwuhan" | "amplop" | "rsvp-wishes" | "petugas" | "domain"
  >("qr-checkin");

  const [copiedRekening, setCopiedRekening] = useState(false);

  const scannedGuest = {
    name: "Bpk. Hendra Gunawan & Keluarga",
    table: "Meja VIP - A02",
    pax: 2,
    time: "19:04 WIB",
  };

  const buwuhList = [
    {
      name: "H. Sulaiman & Ibu",
      address: "Jl. Veteran No. 45, Sleman",
      amount: "Rp 1.000.000",
      type: "Amplop Tunai",
      petugas: "Rina (Meja 1)",
    },
    {
      name: "Ir. Joko Susilo",
      address: "Perum Graha Indah Blok C",
      amount: "Rp 500.000",
      type: "Transfer QRIS",
      petugas: "Sistem Otomatis",
    },
    {
      name: "Ibu Hj. Aminah",
      address: "Bantul, Yogyakarta",
      amount: "Rp 750.000",
      type: "Amplop Tunai",
      petugas: "Doni (Meja 2)",
    },
  ];

  const tabs = [
    { id: "qr-checkin" as const, label: "Scan QR Tamu", icon: QrCode },
    { id: "buwuhan" as const, label: "Catatan Buwuh & Amplop", icon: FileSpreadsheet },
    { id: "amplop" as const, label: "Amplop Digital (QRIS/Bank)", icon: Gift },
    { id: "rsvp-wishes" as const, label: "RSVP & Ucapan Doa", icon: Heart },
    { id: "petugas" as const, label: "Akses Panitia Hari-H", icon: Users },
    { id: "domain" as const, label: "Custom Domain", icon: Globe },
  ];

  return (
    <section id="fitur" className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Fitur lengkap yang membantu resepsi berjalan tertib.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Dirancang berdasarkan alur nyata pernikahan di Indonesia: dari sebar undangan via WhatsApp,
            penyambutan tamu di meja registrasi, hingga pencatatan buwuhan untuk arsip keluarga.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10">
          
          {/* TAB 1: Scan QR Tamu */}
          {activeTab === "qr-checkin" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Meja Penerima Tamu Anti-Antre
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Scan QR code tamu langsung dari kamera HP panitia.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Setiap link undangan yang dibagikan otomatis memiliki tiket QR code unik.
                  Saat tamu datang, panitia penerima tamu cukup memindai QR tersebut dari browser HP.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Menampilkan nomor meja dan kuota souvenir tamu secara instan.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dapat digunakan beberapa panitia di pintu masuk berbeda tanpa data ganda.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <ScanLine className="w-4 h-4 text-primary" />
                    <span>Hasil Scan Meja 01</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium text-[11px]">
                    Tamu Terverifikasi
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-sm text-slate-900">{scannedGuest.name}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-3">
                    <span className="font-semibold text-primary">{scannedGuest.table}</span>
                    <span>•</span>
                    <span>{scannedGuest.pax} Pax Undangan</span>
                    <span>•</span>
                    <span className="text-slate-400">{scannedGuest.time}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 text-center">
                  Data kehadiran langsung tersimpan ke rekap buku tamu secara real-time.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Catatan Buwuhan */}
          {activeTab === "buwuhan" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Pencatatan Sumbangan Tradisi
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Buku catatan buwuhan rapi, lengkap dengan nama dan alamat.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tradisi buwuh / sumbangan pernikahan membutuhkan catatan yang rapi untuk silaturahmi balasan di masa depan.
                  Petugas meja buwuhan dapat mencatat amplop tunai maupun transfer dengan cepat.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Catat nama pemberi, alamat asal, nominal, dan petugas yang menginput.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ekspor data ke Excel (.xlsx) dan CSV kapan saja tanpa batas baris.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs">
                  <span className="font-semibold text-slate-800">Catatan Buwuhan Terkini</span>
                  <span className="font-semibold text-slate-900">Total: Rp 2.250.000</span>
                </div>

                <div className="space-y-2">
                  {buwuhList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.address}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Input: {item.petugas}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{item.amount}</div>
                        <span className="text-[10px] text-slate-500">{item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Amplop Digital */}
          {activeTab === "amplop" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Kado &amp; Amplop Tanpa Sentuhan
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Kado pernikahan via QRIS dan transfer bank tanpa potongan.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Bagi kerabat yang berhalangan hadir, mereka tetap bisa mengirimkan kado tanda kasih
                  lewat QRIS atau nomor rekening bank Anda.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>0% potongan biaya — dana langsung masuk ke rekening pribadi Anda.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Tombol salin nomor rekening sekali klik untuk memudahkan tamu.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pratinjau Kotak Hadiah di Undangan
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">BCA — 8820 1938 4920</div>
                    <div className="text-[11px] text-slate-500">a.n Anindya Paramitha</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("882019384920");
                      setCopiedRekening(true);
                      setTimeout(() => setCopiedRekening(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedRekening ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRekening ? "Disalin" : "Salin No. Rek"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RSVP & Doa */}
          {activeTab === "rsvp-wishes" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Konfirmasi Tamu &amp; Buku Doa
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Pantau konfirmasi kehadiran dan baca ucapan doa dari tamu.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tamu dapat mengonfirmasi apakah akan hadir atau berhalangan beserta perkiraan jumlah orang,
                  sehingga Anda dapat memperkirakan porsi katering dengan lebih tepat.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Rekap kehadiran terkelompok rapi (Hadir / Tidak Hadir / Belum Respon).</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ucapan doa restu dapat dimoderasi atau ditayangkan di layar resepsi.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
                  Ucapan Doa Masuk
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Clarissa &amp; Kevin</span>
                    <span className="text-[10px] text-slate-400 font-normal">5 menit lalu</span>
                  </div>
                  <p className="text-slate-600">
                    "Selamat menempuh hidup baru Dimas &amp; Anindya! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Magic Link Petugas */}
          {activeTab === "petugas" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Kemudahan Panitia Hari-H
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Undang panitia penerima tamu via Magic Link tanpa registrasi.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Cukup kirimkan link khusus ke WhatsApp panitia/keluarga yang bertugas.
                  Mereka langsung bisa membuka alat scan dan pencatat buwuh tanpa perlu repot membuat akun.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Akses instan 1-klik aman lewat browser HP.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Akses dapat dinonaktifkan sewaktu-waktu setelah acara selesai.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
                <div className="text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
                  Daftar Petugas Aktif
                </div>
                <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Rina Novitasari</div>
                    <div className="text-[11px] text-slate-500">Penerima Tamu Meja 1</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Custom Domain */}
          {activeTab === "domain" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Kesan Eksklusif
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Gunakan domain nama sendiri tanpa watermark platform.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Bagi Anda yang menginginkan kesan eksklusif, undangan bisa dihubungkan ke domain sendiri
                  seperti <strong>dimas-anindya.com</strong> atau <strong>anindyadimas.wedding</strong>.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Termasuk sertifikat keamanan SSL (HTTPS) otomatis.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Cocok juga untuk Wedding Organizer yang ingin branding nama vendor sendiri.</span>
                  </div>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center">
                <div className="font-mono text-sm sm:text-base font-bold text-slate-900 bg-slate-100 p-3 rounded-xl border border-slate-200 inline-block">
                  https://anindya-dimas.wedding
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  ✓ Tautan elegan dan mudah diingat oleh tamu
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
