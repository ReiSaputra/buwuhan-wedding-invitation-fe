export function LandingTestimonials() {
  const reviews = [
    {
      name: "Dimas & Anindya",
      role: "Pengantin",
      location: "Jakarta",
      text: "Fitur scan QR meja tamu sangat membantu. Tamu yang datang nggak perlu antre lama buat nulis buku tamu manual, dan rekap amplop buwuhan langsung bisa didownload ke Excel.",
    },
    {
      name: "Rian Pratama",
      role: "Wedding Organizer",
      location: "Yogyakarta",
      text: "Fitur Magic Link panitia paling berguna bagi kami. Tim penerima tamu di lapangan bisa langsung buka scanner di HP tanpa harus login atau registrasi akun.",
    },
    {
      name: "Maya & Kevin",
      role: "Pengantin",
      location: "Surabaya",
      text: "Tampilan undangannya responsif dan gampang disebar via WhatsApp. Tamu senang karena bisa langsung konfirmasi kehadiran dan lihat petunjuk maps lokasi acara.",
    },
  ];

  return (
    <section id="testimoni" className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            Pengalaman Pengguna
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Pengalaman nyata dari mempelai dan Wedding Organizer yang telah memanfaatkan sistem Buwuhan.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
            >
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
                "{item.text}"
              </p>

              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.role} • {item.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
