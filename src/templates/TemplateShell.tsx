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
import type { TemplateProps } from '@/templates/template-props'
import type { TemplateTheme } from '@/templates/template-themes'
import { Sparkles } from 'lucide-react'

export type TemplateShellProps = TemplateProps & {
  /** Tema visual yang menentukan seluruh warna dan tipografi template */
  theme: TemplateTheme
}

/**
 * Kerangka bersama seluruh template undangan.
 *
 * Menangani state cover, pemutaran musik, penguncian scroll, dan urutan
 * section. Perbedaan antar template sepenuhnya berasal dari objek `theme`,
 * sehingga menambah template baru tidak lagi berarti menyalin ratusan
 * baris JSX.
 */
export function TemplateShell({ data, theme }: TemplateShellProps) {
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
  } = data

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

  const displayNames = coupleNames || `${groomName} ${brideName}`.trim()

  return (
    <div data-template={theme.key} className={theme.page}>
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-112191.mp3"
        preload="auto"
      />

      {!isOpened && (
        <CoverSection
          theme={theme}
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

          {theme.heroWrapper ? (
            <div className={theme.heroWrapper}>
              <HeroIntroSection
                groomName={groomName}
                brideName={brideName}
                eventDateStr={eventDateText}
              />
            </div>
          ) : (
            <HeroIntroSection
              groomName={groomName}
              brideName={brideName}
              eventDateStr={eventDateText}
            />
          )}

          <CoupleSection groom={groom} bride={bride} />

          <EventDetailsSection
            eventDate={eventDate}
            eventDateText={eventDateText}
            eventTime={eventTime}
            venue={venue}
            address={address}
            coupleNames={displayNames}
          />

          <LoveStoryGallerySection
            loveStories={loveStories}
            galleryPhotos={galleryPhotos}
          />

          <WishesSection slug={slug} guestNameDefault={guestName} />

          <GiftSection />

          <footer className={`py-16 px-6 text-center space-y-4 ${theme.footer}`}>
            <p className={`text-xs ${theme.footerText}`}>
              Merupakan suatu kehormatan &amp; kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
            <h3 className={`text-3xl ${theme.footerTitle}`}>{displayNames}</h3>
            <div className={`pt-6 flex items-center justify-center gap-1.5 text-xs ${theme.footerMeta}`}>
              <span>Powered by</span>
              <strong className="font-semibold flex items-center gap-1">
                {theme.footerSparkles && <Sparkles size={12} />}
                Buwuhan Wedding Platform
              </strong>
            </div>
          </footer>
        </main>
      )}
    </div>
  )
}