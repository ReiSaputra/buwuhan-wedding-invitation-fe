import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Navigation, CalendarPlus } from 'lucide-react'

export type EventDetailsSectionProps = {
  eventDateStr?: string
}

/**
 * Komponen Rangkaian Acara, Countdown Timer, dan Lokasi Pernikahan.
 * Menampilkan hitung mundur waktu real-time, rincian Akad Nikah dan Resepsi,
 * serta tombol navigasi peta Google Maps dan sinkronisasi Google Calendar.
 * 
 * @param props - Properti EventDetailsSection
 */
export function EventDetailsSection({
  eventDateStr = '2026-01-18T08:00:00',
}: EventDetailsSectionProps) {
  // Hitung mundur waktu real-time
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    function calculate() {
      const difference = +new Date(eventDateStr) - +new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [eventDateStr])

  /**
   * Menambahkan acara ke Google Calendar secara otomatis.
   */
  function handleAddToCalendar() {
    const title = encodeURIComponent('Pernikahan Han & Saputra')
    const details = encodeURIComponent('Menghadiri pernikahan Han & Saputra di Grand Ballroom Hotel Mulia.')
    const location = encodeURIComponent('Grand Ballroom Hotel Mulia, Jakarta')
    const dates = '20260118T010000Z/20260118T070000Z'
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`
    window.open(url, '_blank')
  }

  return (
    <section id="acara" className="py-20 px-6 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Countdown Timer */}
        <div className="text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-sage">
            Save The Date
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Menghitung Hari Bahagia
          </h2>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
            {[
              { label: 'Hari', value: timeLeft.days },
              { label: 'Jam', value: timeLeft.hours },
              { label: 'Menit', value: timeLeft.minutes },
              { label: 'Detik', value: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gold/30 bg-white p-3 sm:p-4 shadow-sm text-center"
              >
                <span className="font-display text-2xl sm:text-4xl font-bold text-sage">
                  {item.value}
                </span>
                <span className="block text-[10px] sm:text-xs font-semibold uppercase text-slate-500 mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-2 rounded-full border border-sage bg-white px-5 py-2.5 text-xs font-bold text-sage hover:bg-sage hover:text-white transition shadow-xs cursor-pointer active:scale-95"
          >
            <CalendarPlus size={15} />
            <span>Tambahkan ke Google Calendar</span>
          </button>
        </div>

        {/* Cards Rangkaian Acara */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          {/* Akad Nikah */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-sage/10 px-3.5 py-1 text-xs font-bold text-sage uppercase">
                <Calendar size={13} />
                <span>Akad Nikah</span>
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-900">
                Minggu, 18 Januari 2026
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <p className="flex items-center gap-2 font-medium">
                  <Clock size={15} className="text-gold" />
                  <span>08.00 - 10.00 WIB</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                  <span>Masjid Agung Al-Azhar, Kebayoran Baru, Jakarta Selatan</span>
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Masjid+Agung+Al-Azhar+Jakarta"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sage px-4 py-2.5 text-xs font-bold text-white hover:bg-sage-dark transition shadow-xs"
            >
              <Navigation size={14} />
              <span>Petunjuk Arah Google Maps</span>
            </a>
          </motion.div>

          {/* Resepsi Pernikahan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl border-2 border-gold bg-white p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6 relative"
          >
            <span className="absolute -top-3 right-6 rounded-full bg-gold text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Acara Utama
            </span>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1 text-xs font-bold text-gold uppercase">
                <Calendar size={13} />
                <span>Resepsi Pernikahan</span>
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-900">
                Minggu, 18 Januari 2026
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <p className="flex items-center gap-2 font-medium">
                  <Clock size={15} className="text-gold" />
                  <span>Sesi 1: 11.00 - 13.00 WIB | Sesi 2: 18.30 - 21.00 WIB</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                  <span>Grand Ballroom Hotel Mulia, Senayan, Jakarta Pusat</span>
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-xs"
            >
              <Navigation size={14} />
              <span>Petunjuk Arah Google Maps</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
