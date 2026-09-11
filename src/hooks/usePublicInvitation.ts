import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchData } from '@/lib/api'
import type {
  ApiInvitation,
  ApiCouple,
  PublicInvitationViewModel,
} from '@/types/invitation-api'

/** Nama hari dalam bahasa Indonesia, indeks mengikuti Date.getDay(). */
const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
]

/** Nama bulan dalam bahasa Indonesia, indeks mengikuti Date.getMonth(). */
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/**
 * Memformat tanggal ISO menjadi teks panjang Indonesia.
 * Contoh: "2026-01-18" -> "Minggu, 18 Januari 2026"
 *
 * @param isoDate - Tanggal ISO dari backend, boleh null
 * @returns Teks tanggal, atau string kosong bila tanggal belum diisi
 */
export function formatLongDateId(isoDate: string | null | undefined): string {
  if (!isoDate) return ''

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Mencari data mempelai berdasarkan tipenya.
 *
 * @param couples - Daftar mempelai dari backend
 * @param type - 'GROOM' untuk mempelai pria, 'BRIDE' untuk wanita
 * @returns Data mempelai, atau null bila tidak ditemukan
 */
function findCouple(
  couples: ApiCouple[] | undefined,
  type: 'GROOM' | 'BRIDE',
): ApiCouple | null {
  return couples?.find((couple) => couple.type === type) ?? null
}

/**
 * Custom React Hook untuk mengambil data undangan publik berdasarkan slug pada URL.
 * Memanggil endpoint publik `GET /public/invitations/:slug` yang tidak memerlukan login,
 * lalu menyediakan data siap-pakai untuk seluruh section halaman undangan.
 *
 * @returns Data undangan mentah, data mempelai terpisah, teks tanggal terformat, dan flag status
 *
 * @example
 * const { groom, bride, eventDateText, isLoading } = usePublicInvitation()
 */
export function usePublicInvitation() {
  // Route publik memakai /undangan/:slug, jadi ambil param `slug` (bukan `id`)
  const { slug = '' } = useParams<{ slug: string }>()

  const query = useQuery({
    // Endpoint PUBLIK -- tidak memerlukan access token
    queryKey: ['public-invitation', slug],
    queryFn: () => fetchData<ApiInvitation>(`/public/invitations/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  })

  const invitation = query.data ?? null
const groom = findCouple(invitation?.couples, 'GROOM')
const bride = findCouple(invitation?.couples, 'BRIDE')

const eventCategory = invitation?.eventCategory ?? 'WEDDING'
const showCelebrant =
  invitation?.showCelebrant ?? eventCategory !== 'WEDDING'
const showCouples =
  invitation?.showCouples ?? eventCategory === 'WEDDING'
const celebrant = invitation?.celebrant ?? null

const eventLabel = {
  WEDDING: 'Pernikahan',
  KHITANAN: 'Khitanan',
  RASULAN: 'Rasulan',
  AQIQAH: 'Aqiqah',
}[eventCategory]

const coupleNames =
  groom && bride ? `${groom.name} & ${bride.name}` : ''

const displayName =
  showCelebrant && celebrant ? celebrant.name : coupleNames

  // Seluruh data siap tampil dikumpulkan jadi satu objek agar bisa
  // diteruskan utuh sebagai props ke komponen template.
  const viewModel: PublicInvitationViewModel = {
    slug,
id: invitation?.id ?? '',
invitation,
eventCategory,
showCouples,
showCelebrant,
celebrant,
eventLabel,
displayName,

// Data mempelai terpisah
groom,
bride,

    // Nilai siap tampil, dengan pengaman bila data belum ada
    groomName: groom?.name ?? '',
    brideName: bride?.name ?? '',
    coupleNames,
    eventDateText: formatLongDateId(invitation?.eventDate),
    eventDate: invitation?.eventDate ?? null,
    eventTime: invitation?.eventTime ?? '',
    venue: invitation?.venue ?? '',
    address: invitation?.address ?? '',
    galleryPhotos: invitation?.galleryPhotos ?? [],
    loveStories: invitation?.loveStories ?? [],
    giftAccounts: invitation?.giftAccounts ?? [],
    giftAddress: invitation?.giftAddress ?? null,
    templateId: invitation?.template?.id ?? '',
    templateSlug: invitation?.template?.slug ?? '',
  }

  return {
    // Disebar flat agar pemakaian lama tetap berjalan
    ...viewModel,

    // Objek utuh untuk diteruskan ke <TemplateRenderer data={...} />
    viewModel,

    // Status permintaan
    isLoading: Boolean(slug) && query.isLoading,
    isError: query.isError,
    isNotFound: query.isError && !query.data,
  }
}