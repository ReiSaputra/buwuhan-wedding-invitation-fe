import { useMemo, useState } from 'react'
import type { GuestBookEntry, NewGuestInput } from '@/types/panel'

const MOCK_ENTRIES: GuestBookEntry[] = [
  { id: 'b1', name: 'Budi Santoso', category: 'Rekan Kerja', status: 'HADIR', recordedAt: '2026-01-18T14:30:00+07:00', phone: '081234567890', message: 'Selamat berbahagia! Semoga menjadi keluarga sakinah, mawaddah, wa rahmah.' },
  { id: 'b2', name: 'Siti Aminah & Keluarga', category: 'Keluarga', status: 'HADIR', recordedAt: '2026-01-18T10:15:00+07:00', phone: '081987654321', message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair.' },
  { id: 'b3', name: 'Andi Pratama', category: 'Sahabat', status: 'TIDAK_HADIR', recordedAt: '2026-01-17T19:45:00+07:00', phone: '081223344556', message: 'Maaf belum bisa hadir karena tugas luar kota. Doa terbaik dari jauh.' },
  { id: 'b4', name: 'Dr. Handoko', category: 'Dosen', status: 'HADIR', recordedAt: '2026-01-17T08:20:00+07:00', phone: '081277889900' },
  { id: 'b5', name: 'Citra Lestari', category: 'Sahabat', status: 'HADIR', recordedAt: '2026-01-16T16:05:00+07:00', message: 'Akhirnya sah juga! Bahagia terus ya kalian berdua.' },
  { id: 'b6', name: 'H. Ahmad Fauzi', category: 'VIP', status: 'HADIR', recordedAt: '2026-01-16T11:40:00+07:00', phone: '081399887766' },
  { id: 'b7', name: 'Pak Slamet', category: 'Tetangga', status: 'HADIR', recordedAt: '2026-01-15T18:25:00+07:00', message: 'Turut bahagia, sukses selalu untuk keluarga baru.' },
  { id: 'b8', name: 'Rina Marlina', category: 'Rekan Kerja', status: 'TIDAK_HADIR', recordedAt: '2026-01-15T09:10:00+07:00', phone: '081744556677' },
  { id: 'b9', name: 'Keluarga Suryono', category: 'Keluarga', status: 'HADIR', recordedAt: '2026-01-14T20:00:00+07:00', message: 'Semoga langgeng sampai kakek nenek.' },
  { id: 'b10', name: 'Dewi Anggraini', category: 'Sahabat', status: 'HADIR', recordedAt: '2026-01-14T13:35:00+07:00', phone: '081611223344' },
  { id: 'b11', name: 'Tono Wijaya', category: 'Teman Sekolah', status: 'HADIR', recordedAt: '2026-01-13T17:50:00+07:00' },
  { id: 'b12', name: 'Bu Endang', category: 'Tetangga', status: 'HADIR', recordedAt: '2026-01-13T08:05:00+07:00', message: 'Selamat ya nak, semoga cepat diberi momongan.' },
]

/**
 * Hook pengelola data Buku Tamu: catatan kehadiran nyata dan ucapan tamu.
 *
 * Daftar disimpan di dalam state agar tombol Tambah, Ubah, dan Hapus langsung
 * terlihat hasilnya walau backend belum tersedia. Setelah API siap, ganti
 * `useState` dengan `useQuery` dan ketiga fungsi aksi dengan `useMutation`.
 *
 * Parameter diberi awalan garis bawah karena belum terpakai. TypeScript hanya
 * memperbolehkan parameter tak terpakai bila namanya dimulai dengan `_`
 * (aturan `noUnusedParameters` yang aktif di proyek ini).
 *
 * @param _invitationId - ID undangan yang sedang dikelola
 * @returns Daftar `entries`, rekap `stats`, dan aksi tambah/ubah/hapus
 */
export function useGuestBook(_invitationId: string) {
  const [entries, setEntries] = useState<GuestBookEntry[]>(MOCK_ENTRIES)

  /** Menambahkan tamu baru ke urutan paling atas daftar. */
  function addGuest(input: NewGuestInput) {
    const newEntry: GuestBookEntry = {
      id: `b-${Date.now()}`,
      name: input.name,
      category: input.category,
      status: 'HADIR',
      recordedAt: new Date().toISOString(),
      phone: input.phone,
      message: input.note,
    }
    setEntries((prev) => [newEntry, ...prev])
  }

  /** Memperbarui data satu tamu tanpa mengubah status dan waktu check-in. */
  function updateGuest(id: string, input: NewGuestInput) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              name: input.name,
              category: input.category,
              phone: input.phone,
              message: input.note,
            }
          : entry,
      ),
    )
  }

  /** Menghapus satu catatan tamu berdasarkan ID. */
  function removeGuest(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const stats = useMemo(
    () => ({
      total: entries.length,
      hadir: entries.filter((entry) => entry.status === 'HADIR').length,
      tidakHadir: entries.filter((entry) => entry.status === 'TIDAK_HADIR').length,
    }),
    [entries],
  )

  return { entries, stats, addGuest, updateGuest, removeGuest, isLoading: false }
}
