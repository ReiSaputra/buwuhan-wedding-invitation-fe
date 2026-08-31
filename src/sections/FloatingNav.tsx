import {
  Heart,
  Calendar,
  Image,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react'

export type FloatingNavProps = {
  isMusicPlaying: boolean
  onToggleMusic: () => void
}

/**
 * Komponen Navigasi Melayang (Floating Bottom Bar) & Pemutar Musik.
 * Memudahkan tamu berpindah antar section (Mempelai, Acara, Galeri, RSVP, Ucapan, Hadiah, Tiket QR)
 * serta mengaktifkan/menonaktifkan alunan musik latar.
 * 
 * @param props - Properti FloatingNav (isMusicPlaying, onToggleMusic)
 */
export function FloatingNav({ isMusicPlaying, onToggleMusic }: FloatingNavProps) {
  const navItems = [
    { label: 'Mempelai', href: '#mempelai', icon: <Heart size={15} /> },
    { label: 'Acara', href: '#acara', icon: <Calendar size={15} /> },
    { label: 'Galeri', href: '#galeri', icon: <Image size={15} /> },
    { label: 'Kehadiran', href: '#ucapan', icon: <MessageSquare size={15} /> },
  ]

  /**
   * Menggeser scroll tampilan ke elemen target section secara mulus.
   * 
   * @param e - Event klik mouse
   * @param href - Selector ID elemen target
   */
  function handleScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-2 shadow-2xl backdrop-blur-md border border-white/20 text-white max-w-[94vw] overflow-x-auto">
      {navItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={(e) => handleScroll(e, item.href)}
          title={item.label}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/75 hover:bg-white/20 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          {item.icon}
        </a>
      ))}

      <div className="h-4 w-px bg-white/20 mx-1 shrink-0" />

      {/* Tombol Pengontrol Musik */}
      <button
        type="button"
        onClick={onToggleMusic}
        title={isMusicPlaying ? 'Matikan Musik' : 'Putar Musik'}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer active:scale-95 ${
          isMusicPlaying
            ? 'bg-gold text-white animate-spin-slow shadow-xs'
            : 'bg-white/10 text-white/60 hover:text-white'
        }`}
      >
        {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  )
}
