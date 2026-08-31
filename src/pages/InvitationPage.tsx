import { useGuest } from '@/hooks/useGuest'
import { usePublicInvitation } from '@/hooks/usePublicInvitation'
import { Heart, HeartCrack } from 'lucide-react'
import TemplateElegan from '@/templates/TemplateElegan'
import TemplateKlasik from '@/templates/TemplateKlasik'

/**
 * Halaman Utama Undangan Pernikahan Digital Publik (`/undangan/:slug`).
 * Berfungsi sebagai "Router" untuk merender desain template yang sesuai 
 * dengan pilihan mempelai, berdasarkan `templateId`.
 */
export default function InvitationPage() {
  const { isLoading: isGuestLoading } = useGuest()
  const { isLoading: isInvitationLoading, isNotFound, templateId } = usePublicInvitation()

  // Halaman baru siap ditampilkan setelah data undangan dan data tamu selesai dimuat
  const isLoading = isGuestLoading || isInvitationLoading

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
            kembali tautan yang Anda terima dari mempelai.
          </p>
        </div>
      </div>
    )
  }

  // Pilih template berdasarkan ID Template
  // ID ini harus disesuaikan dengan ID yang ada di database / API Anda
  if (templateId === 'cmthe5f040002scsmz80xac8b') {
    return <TemplateKlasik />
  }

  // Default fallback jika templateId tidak cocok / kosong (misal ID 'cmthe5f040002scsmz80xac8a')
  return <TemplateElegan />
}