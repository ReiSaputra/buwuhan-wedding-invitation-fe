import { useGuest } from '@/hooks/useGuest'
import { usePublicInvitation } from '@/hooks/usePublicInvitation'
import { Heart, HeartCrack } from 'lucide-react'
import { TemplateRenderer } from '@/templates/TemplateRenderer'
import { usePageMeta } from '@/hooks/usePageMeta'

/**
 * Halaman Utama Undangan Pernikahan Digital Publik (`/undangan/:slug`).
 * Berfungsi sebagai "Router" untuk merender desain template yang sesuai 
 * dengan pilihan mempelai, berdasarkan `template.slug` dari response API.
 */
export default function InvitationPage() {
  const {
    slug,
    isLoading: isInvitationLoading,
    isNotFound,
    templateSlug,
    displayName,
eventLabel,
eventDateText,
    venue,
    galleryPhotos,
    viewModel,
  } = usePublicInvitation()
  const { isLoading: isGuestLoading } = useGuest(slug)

  // Halaman baru siap ditampilkan setelah data undangan dan data tamu selesai dimuat
  const isLoading = isGuestLoading || isInvitationLoading

    // Judul tab & meta Open Graph mengikuti data undangan yang sedang dibuka
  usePageMeta({
    title: displayName
  ? `Undangan ${eventLabel} ${displayName}`
  : 'Undangan Buwuhan',
    description: eventDateText
      ? `Dengan penuh rasa syukur, kami mengundang Anda hadir pada ${eventDateText}${venue ? ` di ${venue}` : ''}.`
      : undefined,
    imageUrl: galleryPhotos[0]?.imageUrl,
    url: `${import.meta.env.VITE_PUBLIC_BASE_URL ?? ''}/undangan/${slug}`,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <Heart size={36} className="mx-auto text-gold animate-pulse" />
          <p className="font-display text-lg font-semibold text-sage">
            Mempersiapkan Undangan...
          </p>
        </div>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-sm space-y-3 text-center">
          <HeartCrack size={40} className="mx-auto text-gold" />
          <h1 className="font-display text-2xl font-bold text-sage">
            Undangan Tidak Ditemukan
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Tautan undangan ini tidak valid atau sudah tidak berlaku. Silakan periksa
            kembali tautan yang Anda terima dari penyelenggara acara.
          </p>
        </div>
      </div>
    )
  }

  // Pemilihan desain mengikuti slug template dari backend, dan seluruh
  // data undangan diteruskan sebagai props tunggal ke template terpilih
  return <TemplateRenderer slug={templateSlug} data={viewModel} />
}