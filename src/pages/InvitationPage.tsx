import { useEffect, useState } from 'react'
import { CoverSection } from '@/sections/CoverSection'
import { useGuest } from '@/hooks/useGuest'

export default function InvitationPage() {
  const { guestName, isLoading } = useGuest()
  const [isOpened, setIsOpened] = useState(false)

  // Kunci scroll selama cover masih tertutup
  useEffect(() => {
    document.body.classList.toggle('is-locked', !isOpened)
    return () => document.body.classList.remove('is-locked')
  }, [isOpened])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-display text-xl text-sage">Memuat undangan…</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      {!isOpened && (
        <CoverSection
          guestName={guestName}
          groomName="Buwuhan"
          brideName="Pasangan"
          onOpen={() => setIsOpened(true)}
        />
      )}

      {/* Section berikutnya kita bangun di Tahap 2 */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-xs tracking-[0.3em] text-sage uppercase">Bismillah</p>
        <h2 className="mt-6 max-w-xl font-display text-3xl leading-snug text-ink">
          Undangan berhasil dibuka
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
          Fondasi frontend sudah jalan. Section Mempelai, Countdown, Lokasi,
          Galeri, RSVP, dan Ucapan akan kita tambahkan berikutnya.
        </p>
      </section>
    </main>
  )
}