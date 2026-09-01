import { useMemo, useState } from 'react'
import type { GiftRecord, GiftStats } from '@/types/panel'

const MOCK_GIFTS: GiftRecord[] = [
  { id: 'g1', guestName: 'Andi Susanto', kind: 'UANG', amount: 1000000, itemName: null, methodLabel: 'Transfer BCA', isDigital: true, createdAt: '2026-01-18T14:30:00+07:00' },
  { id: 'g2', guestName: 'Citra Lestari', kind: 'UANG', amount: 500000, itemName: null, methodLabel: 'Amplop Lokasi', isDigital: false, createdAt: '2026-01-17T19:45:00+07:00' },
  { id: 'g3', guestName: 'H. Ahmad Fauzi', kind: 'UANG', amount: 2500000, itemName: null, methodLabel: 'Transfer Mandiri', isDigital: true, createdAt: '2026-01-17T10:12:00+07:00' },
  { id: 'g4', guestName: 'Keluarga Wijaya', kind: 'BARANG', amount: null, itemName: 'Set Peralatan Dapur', methodLabel: 'Diserahkan Langsung', isDigital: false, createdAt: '2026-01-16T16:40:00+07:00' },
  { id: 'g5', guestName: 'Dr. Handoko', kind: 'UANG', amount: 1500000, itemName: null, methodLabel: 'Transfer BCA', isDigital: true, createdAt: '2026-01-16T09:05:00+07:00' },
  { id: 'g6', guestName: 'Pak Slamet', kind: 'UANG', amount: 300000, itemName: null, methodLabel: 'Amplop Lokasi', isDigital: false, createdAt: '2026-01-15T20:30:00+07:00' },
  { id: 'g7', guestName: 'Rina Marlina', kind: 'BARANG', amount: null, itemName: 'Dispenser & Kipas Angin', methodLabel: 'Kiriman Kurir', isDigital: false, createdAt: '2026-01-15T13:18:00+07:00' },
  { id: 'g8', guestName: 'Budi Santoso', kind: 'UANG', amount: 750000, itemName: null, methodLabel: 'QRIS', isDigital: true, createdAt: '2026-01-14T18:55:00+07:00' },
  { id: 'g9', guestName: 'Keluarga Suryono', kind: 'UANG', amount: 1200000, itemName: null, methodLabel: 'Transfer BRI', isDigital: true, createdAt: '2026-01-14T11:22:00+07:00' },
  { id: 'g10', guestName: 'Bu Endang', kind: 'BARANG', amount: null, itemName: 'Seperangkat Sprei & Bantal', methodLabel: 'Diserahkan Langsung', isDigital: false, createdAt: '2026-01-13T15:00:00+07:00' },
]

/**
 * Hook pengelola catatan pemberian tamu (uang maupun barang) untuk satu undangan.
 *
 * ⚠️ DATA MASIH CONTOH. Backend belum memiliki model dan endpoint untuk hadiah,
 * sehingga `invitationId` belum dipakai. Setelah endpoint tersedia, ganti isi
 * hook ini dengan useQuery ke GET /invitations/:invitationId/gifts.
 *
 * @param invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `gifts`, rekap `stats`, dan aksi `removeGift`
 */
export function useGifts(invitationId: string) {
  // Parameter sengaja "dikonsumsi" agar tanda tangan hook tetap stabil
  // dan pemanggil tidak perlu diubah saat integrasi backend menyusul.
  void invitationId

  const [gifts, setGifts] = useState<GiftRecord[]>(MOCK_GIFTS)

  /** Menghapus satu catatan pemberian berdasarkan ID. */
  function removeGift(id: string) {
    setGifts((prev) => prev.filter((gift) => gift.id !== id))
  }

  const stats = useMemo<GiftStats>(
    () => ({
      // Hanya pemberian berjenis uang yang dijumlahkan
      totalAmount: gifts.reduce((sum, gift) => sum + (gift.amount ?? 0), 0),
      // Set dipakai agar satu tamu yang memberi dua kali tetap dihitung satu orang
      participantCount: new Set(gifts.map((gift) => gift.guestName)).size,
    }),
    [gifts],
  )

  return { gifts, stats, removeGift, isLoading: false }
}
