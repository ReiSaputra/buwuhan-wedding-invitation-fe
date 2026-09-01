import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Navigation, CalendarPlus } from 'lucide-react'

export type EventDetailsSectionProps = {
  /** Tanggal acara format ISO dari backend, untuk hitung mundur */
  eventDate: string | null
  /** Tanggal acara yang sudah diformat bahasa Indonesia, untuk ditampilkan */
  eventDateText: string
  /** Waktu acara bebas teks, contoh: '08.00 - 12.00 WIB' */
  eventTime: string
  /** Nama tempat acara */
  venue: string
  /** Alamat lengkap tempat acara */
  address: string
  /** Nama kedua mempelai, dipakai untuk judul di Google Calendar */
  coupleNames: string
}

/**
 * Mengubah tanggal ISO menjadi format tanggal Google Calendar (YYYYMMDD).
 *
 * @param isoDate - Tanggal ISO dari backend
 * @param dayOffset - Jumlah hari yang ditambahkan, dipakai untuk tanggal akhir
 * @returns Teks tanggal format Google Calendar, atau string kosong bila tidak valid
 */
function toCalendarDate(isoDate: string | null, dayOffset = 0): string {
  if (!isoDate) return ''

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  date.setDate(date.getDate() + dayOffset)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

/**
 * Komponen Rangkaian Acara, Countdown Timer, dan Lokasi Pernikahan.
 * Menampilkan hitung mundur waktu real-time menuju hari acara, rincian waktu
 * dan tempat, serta tombol navigasi Google Maps dan Google Calendar.
 *
 * @param props - Properti EventDetailsSection
 */
export function EventDetailsSection({
  eventDate,
  eventDateText,
  eventTime,
  venue,
  address,
  coupleNames,
}: EventDetailsSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (!eventDate) return

    function calculate() {
      const difference = +new Date(eventDate as string) - +new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [eventDate])

  // Gabungan tempat dan alamat untuk pencarian peta
  const fullLocation = [venue, address].filter(Boolean).join(', ')
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullLocation)}`

  /**
   * Menambahkan acara pernikahan ke Google Calendar pengguna.
   */
  function handleAddToCalendar() {
    const startDate = toCalendarDate(eventDate)
    const endDate = toCalendarDate(eventDate, 1)
    if (!startDate) return

    const title = encodeURIComponent(`Pernikahan ${coupleNames}`)
    const details = encodeURIComponent(
      `Menghadiri pernikahan ${coupleNames}${fullLocation ? ` di ${fullLocation}` : ''}.`,
    )
    const location = encodeURIComponent(fullLocation)
    const dates = `${startDate}/${endDate}`

    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`,
      '_blank',
    )
  }

  return (
    <section id="acara" className="py-20 px-6 bg-inv-page relative overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Countdown Timer */}
        <div className="text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-accent">
            Save The Date
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-inv-ink">
            Menghitung Hari Bahagia
          </h2>

          {eventDate ? (
            <>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                {[
                  { label: 'Hari', value: timeLeft.days },
                  { label: 'Jam', value: timeLeft.hours },
                  { label: 'Menit', value: timeLeft.minutes },
                  { label: 'Detik', value: timeLeft.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-inv-gold/30 bg-inv-card p-3 sm:p-4 shadow-sm text-center"
                  >
                    <span className="font-display text-2xl sm:text-4xl font-bold text-inv-accent">
                      {item.value}
                    </span>
                    <span className="block text-[10px] sm:text-xs font-semibold uppercase text-inv-ink-muted mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 rounded-full border border-inv-accent bg-inv-card px-5 py-2.5 text-xs font-bold text-inv-accent hover:bg-inv-accent hover:text-inv-on-accent transition shadow-xs cursor-pointer active:scale-95"
              >
                <CalendarPlus size={15} />
                <span>Tambahkan ke Google Calendar</span>
              </button>
            </>
          ) : (
            <p className="text-sm text-inv-ink-muted italic">
              Tanggal acara akan segera diumumkan.
            </p>
          )}
        </div>

        {/* Kartu Rincian Acara */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border-2 border-inv-gold bg-inv-card p-6 sm:p-8 shadow-md space-y-6 relative"
        >
          <span className="absolute -top-3 right-6 rounded-full bg-inv-gold text-inv-on-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Acara Utama
          </span>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-inv-gold/15 px-3.5 py-1 text-xs font-bold text-inv-gold uppercase">
              <Calendar size={13} />
              <span>Resepsi Pernikahan</span>
            </div>

            <h3 className="font-display text-2xl font-bold text-inv-ink">
              {eventDateText || 'Tanggal menyusul'}
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              {eventTime && (
                <p className="flex items-center gap-2 font-medium">
                  <Clock size={15} className="text-inv-gold" />
                  <span>{eventTime}</span>
                </p>
              )}
              {fullLocation && (
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="text-inv-gold shrink-0 mt-0.5" />
                  <span>{fullLocation}</span>
                </p>
              )}
            </div>
          </div>

          {fullLocation && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark px-4 py-2.5 text-xs font-bold text-inv-on-accent hover:opacity-95 transition shadow-xs"
            >
              <Navigation size={14} />
              <span>Petunjuk Arah Google Maps</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  )
}