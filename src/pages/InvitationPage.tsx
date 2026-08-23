import { useEffect, useState, useRef } from 'react'
import { CoverSection } from '@/sections/CoverSection'
import { HeroIntroSection } from '@/sections/HeroIntroSection'
import { CoupleSection } from '@/sections/CoupleSection'
import { EventDetailsSection } from '@/sections/EventDetailsSection'
import { LoveStoryGallerySection } from '@/sections/LoveStoryGallerySection'
import { RsvpSection } from '@/sections/RsvpSection'
import { WishesSection } from '@/sections/WishesSection'
import { GiftSection } from '@/sections/GiftSection'
import { QrTicketSection } from '@/sections/QrTicketSection'
import { FloatingNav } from '@/sections/FloatingNav'
import { useGuest } from '@/hooks/useGuest'
import { Heart, Sparkles } from 'lucide-react'

/**
 * Halaman Utama Undangan Pernikahan Digital Publik (`/undangan/:slug`).
 * Mengintegrasikan seluruh rangkaian fitur interaktif undangan:
 * - Cover depan dengan ornamen mewah
 * - Audio latar belakang yang otomatis menyala saat dibuka
 * - Profil mempelai pria & wanita
 * - Hitung mundur waktu & simpan ke Google Calendar
 * - Petunjuk arah lokasi Google Maps
 * - Galeri foto prewedding & kisah cinta
 * - Formulir konfirmasi kehadiran (RSVP)
 * - Buku ucapan & doa restu real-time
 * - Amplop digital buwuh (salin rekening bank)
 * - E-Ticket QR Code tamu untuk resepsionis
 * - Navigasi melayang (Floating Navigation Bar)
 */
export default function InvitationPage() {
  const { guestName, isLoading } = useGuest()
  const [isOpened, setIsOpened] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Konfigurasi nama pasangan berdasarkan slug atau default
  const groomName = 'Hanung'
  const brideName = 'Ratna'
  const eventDateStr = 'Minggu, 18 Januari 2026'

  // Kunci scroll saat cover masih aktif
  useEffect(() => {
    document.body.classList.toggle('is-locked', !isOpened)
    return () => document.body.classList.remove('is-locked')
  }, [isOpened])

  /**
   * Menangani aksi pembukaan undangan & memutar musik latar.
   */
  function handleOpenInvitation() {
    setIsOpened(true)
    setIsMusicPlaying(true)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay policy fallback
        setIsMusicPlaying(false)
      })
    }
  }

  /**
   * Mengubah status pemutaran audio musik (Play / Pause).
   */
  function handleToggleMusic() {
    if (!audioRef.current) return

    if (isMusicPlaying) {
      audioRef.current.pause()
      setIsMusicPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsMusicPlaying(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <Heart size={36} className="mx-auto text-gold animate-pulse" />
          <p className="font-display text-lg font-semibold text-sage">
            Mempersiapkan Undangan Pernikahan...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream font-body text-slate-800 selection:bg-gold/20 selection:text-sage">
      {/* Audio Elemen Tersembunyi (Romantic Acoustic / Wedding Theme) */}
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-112191.mp3"
        preload="auto"
      />

      {/* 1. Cover Depan */}
      {!isOpened && (
        <CoverSection
          guestName={guestName}
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDateStr}
          onOpen={handleOpenInvitation}
        />
      )}

      {/* 2. Isi Lengkap Undangan (Ditampilkan setelah Cover dibuka) */}
      {isOpened && (
        <main className="animate-in fade-in duration-1000 pb-20">
          {/* Floating Navigation & Audio Control */}
          <FloatingNav
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={handleToggleMusic}
          />

          {/* Salam & Ayat Suci Pembuka */}
          <HeroIntroSection
            groomName={groomName}
            brideName={brideName}
            eventDateStr={eventDateStr}
          />

          {/* Profil Mempelai */}
          <CoupleSection />

          {/* Rangkaian Acara, Countdown & Lokasi */}
          <EventDetailsSection />

          {/* Kisah Cinta & Galeri Prewedding */}
          <LoveStoryGallerySection />

          {/* Konfirmasi Kehadiran RSVP */}
          <RsvpSection guestNameDefault={guestName} />

          {/* Buku Ucapan & Doa Restu */}
          <WishesSection />

          {/* Amplop Digital & Buwuh */}
          <GiftSection />

          {/* QR Pass Tiket Tamu */}
          <QrTicketSection guestName={guestName} />

          {/* Footer Penutup */}
          <footer className="py-16 px-6 text-center bg-night text-white space-y-4">
            <p className="text-xs text-white/70 tracking-widest uppercase font-semibold">
              Merupakan suatu kehormatan &amp; kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
            <h3 className="font-display text-3xl font-bold text-gold">
              Hanung &amp; Ratna
            </h3>
            <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-1.5 text-xs text-white/50">
              <span>Powered by</span>
              <strong className="text-white font-semibold flex items-center gap-1">
                <Sparkles size={12} className="text-gold" /> Buwuhan Wedding Platform
              </strong>
            </div>
          </footer>
        </main>
      )}
    </div>
  )
}