import { useEffect, useState, useRef } from 'react'
import { CoverSection } from '@/sections/CoverSection'
import { HeroIntroSection } from '@/sections/HeroIntroSection'
import { CoupleSection } from '@/sections/CoupleSection'
import { EventDetailsSection } from '@/sections/EventDetailsSection'
import { LoveStoryGallerySection } from '@/sections/LoveStoryGallerySection'
import { WishesSection } from '@/sections/WishesSection'
import { GiftSection } from '@/sections/GiftSection'
import { FloatingNav } from '@/sections/FloatingNav'
import { useGuest } from '@/hooks/useGuest'
import { usePublicInvitation } from '@/hooks/usePublicInvitation'
import { Sparkles } from 'lucide-react'

export default function TemplateKlasik() {
  const { guestName } = useGuest()
  const {
    groom,
    bride,
    groomName,
    brideName,
    coupleNames,
    eventDateText,
    eventDate,
    eventTime,
    venue,
    address,
    galleryPhotos,
    loveStories,
    slug,
  } = usePublicInvitation()

  const [isOpened, setIsOpened] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Kunci scroll saat cover masih aktif
  useEffect(() => {
    document.body.classList.toggle('is-locked', !isOpened)
    return () => document.body.classList.remove('is-locked')
  }, [isOpened])

  function handleOpenInvitation() {
    setIsOpened(true)
    setIsMusicPlaying(true)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsMusicPlaying(false)
      })
    }
  }

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

  return (
    <div className="min-h-screen bg-slate-900 font-body text-slate-100 selection:bg-gold/20 selection:text-white">
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-112191.mp3"
        preload="auto"
      />

      {!isOpened && (
        <CoverSection
          guestName={guestName}
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDateText}
          onOpen={handleOpenInvitation}
        />
      )}

      {isOpened && (
        <main className="animate-in fade-in duration-1000 pb-20">
          <FloatingNav
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={handleToggleMusic}
          />

          <div className="rounded-b-3xl bg-slate-800 shadow-xl pb-10">
            <HeroIntroSection
              groomName={groomName}
              brideName={brideName}
              eventDateStr={eventDateText}
            />
          </div>

          <CoupleSection groom={groom} bride={bride} />

          <EventDetailsSection
            eventDate={eventDate}
            eventDateText={eventDateText}
            eventTime={eventTime}
            venue={venue}
            address={address}
            coupleNames={coupleNames || `${groomName} ${brideName}`.trim()}
          />

          <LoveStoryGallerySection
            loveStories={loveStories}
            galleryPhotos={galleryPhotos}
          />

          <WishesSection slug={slug} guestNameDefault={guestName} />

          <GiftSection />

          <footer className="py-16 px-6 text-center bg-black text-white space-y-4">
            <p className="text-xs text-white/70 tracking-widest uppercase font-semibold">
              Merupakan suatu kehormatan & kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
            <h3 className="font-display text-3xl font-bold text-gold">
              {coupleNames || `${groomName} ${brideName}`.trim()}
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
