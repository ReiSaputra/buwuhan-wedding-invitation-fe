import dayjs from 'dayjs'
import 'dayjs/locale/id'
import type { ApiEventCategory } from '@/types/invitation-api'

dayjs.locale('id')

export type BuildShareMessageParams = {
  guestName: string
  phone?: string | null
  eventCategory?: ApiEventCategory | null
  title?: string
  subjectName?: string
  eventDate?: string | null
  eventTime?: string | null
  venue?: string | null
  address?: string | null
  invitationUrl: string
}

/**
 * Membersihkan dan memformat nomor HP menjadi format standar internasional WhatsApp (628...).
 */
export function formatWhatsAppPhone(phone?: string | null): string {
  if (!phone) return ''
  // Hapus semua karakter non-digit
  let cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  } else if (cleaned.startsWith('62')) {
    // sudah benar
  }

  return cleaned
}

/**
 * Membangun teks undangan personal untuk dibagikan ke WhatsApp sesuai jenis acara.
 */
export function buildWhatsAppShareMessage({
  guestName,
  phone,
  eventCategory,
  title,
  subjectName,
  eventDate,
  eventTime,
  venue,
  address,
  invitationUrl,
}: BuildShareMessageParams): { message: string; whatsappUrl: string } {
  const cat = (eventCategory || '').toUpperCase()

  let introEventText = 'acara pernikahan kami'
  let defaultEventTitle = 'Pernikahan'

  if (cat === 'KHITANAN') {
    introEventText = 'acara tasyakuran walimatul khitan putra kami'
    defaultEventTitle = 'Khitanan'
  } else if (cat === 'AQIQAH') {
    introEventText = 'acara tasyakuran aqiqah ananda kami'
    defaultEventTitle = 'Aqiqah'
  } else if (cat === 'RASULAN') {
    introEventText = 'acara tasyakuran tradisi rasulan / sedekah bumi'
    defaultEventTitle = 'Rasulan'
  }

  const displayName = subjectName || title || defaultEventTitle
  const formattedDate = eventDate ? dayjs(eventDate).format('dddd, D MMMM YYYY') : null

  let message = `Kepada Yth. Bapak/Ibu/Saudara/i\n*${guestName.trim()}*\n\n`
  message += `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri ${introEventText}:\n\n`
  message += `*${displayName}*\n\n`

  if (formattedDate) {
    message += `🗓 *Hari/Tanggal:* ${formattedDate}\n`
  }
  if (eventTime) {
    message += `⏰ *Waktu:* ${eventTime.includes('WIB') ? eventTime : `${eventTime} WIB`}\n`
  }
  if (venue || address) {
    const loc = [venue, address].filter(Boolean).join(' - ')
    message += `📍 *Lokasi:* ${loc}\n`
  }

  message += `\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\n`
  message += `Buka tautan undangan digital Anda di sini:\n${invitationUrl}\n\n`
  message += `Terima kasih.`

  const cleanPhone = formatWhatsAppPhone(phone)
  const encodedText = encodeURIComponent(message)

  const whatsappUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`

  return { message, whatsappUrl }
}
