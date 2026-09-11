import type { ApiEventCategory } from '@/types/invitation-api'

export interface StoryCategoryMeta {
  sectionTitle: string
  sectionSubtitle: string
  kickerSubtitle: string
  emptyTitle: string
  emptySubtitle: string
  timePlaceholder: string
  titlePlaceholder: string
  storyPlaceholder: string
  addButtonLabel: string
  editModalTitle: string
  editModalDescription: string
  badgeLabel: string
  iconType: 'heart' | 'scissors' | 'baby' | 'sparkles' | 'book'
  themeColorClass: {
    bg: string
    text: string
    border: string
  }
}

/**
 * Mendapatkan metadata lengkap linimasa cerita berdasarkan jenis acara (Wedding, Khitanan, Aqiqah, Rasulan, dll).
 */
export function getStoryCategoryMeta(
  eventCategory?: ApiEventCategory | string | null,
  count = 0,
): StoryCategoryMeta {
  const cat = (eventCategory ?? '').toUpperCase()

  switch (cat) {
    case 'KHITAN':
    case 'KHITANAN':
      return {
        sectionTitle: `Perjalanan Sang Buah Hati (${count})`,
        sectionSubtitle:
          'Tambahkan rangkaian momen berkesan dan perjalanan tumbuh kembang ananda (opsional).',
        kickerSubtitle: 'Milestone & Journey',
        emptyTitle: 'Belum ada momen cerita yang ditambahkan.',
        emptySubtitle:
          'Gunakan formulir di bawah untuk menambahkan momen kelahiran, masa balita, atau momen penting ananda.',
        timePlaceholder: 'Contoh: 2018, Usia 3 Tahun, atau 10 Juni 2024',
        titlePlaceholder: 'Contoh: Hari Kelahiran / Langkah Pertama / Menjelang Khitan',
        storyPlaceholder: 'Ceritakan momen tumbuh kembang atau kenangan masa kecil ananda...',
        addButtonLabel: 'Tambah Momen Khitanan',
        editModalTitle: 'Edit Momen Khitanan',
        editModalDescription:
          'Perbarui informasi waktu, judul, narasi, atau tautan foto kenangan momen ini.',
        badgeLabel: 'Linimasa Khitanan',
        iconType: 'sparkles',
        themeColorClass: {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
        },
      }

    case 'AQIQAH':
      return {
        sectionTitle: `Momen Kelahiran & Aqiqah (${count})`,
        sectionSubtitle:
          'Tambahkan momen menyambut kelahiran ananda dan tasyakuran aqiqah keluarga (opsional).',
        kickerSubtitle: 'Momen Berharga',
        emptyTitle: 'Belum ada momen cerita yang ditambahkan.',
        emptySubtitle:
          'Gunakan formulir di bawah untuk menambahkan momen menyambut kelahiran sang buah hati dan doa keluarga.',
        timePlaceholder: 'Contoh: 15 Mei 2024, Usia 7 Hari, atau Hari Ini',
        titlePlaceholder: 'Contoh: Hari Kelahiran / Pemberian Nama / Tasyakuran Aqiqah',
        storyPlaceholder:
          'Ceritakan rasa syukur dan kebahagiaan menyambut kehadiran sang buah hati...',
        addButtonLabel: 'Tambah Momen Aqiqah',
        editModalTitle: 'Edit Momen Aqiqah',
        editModalDescription:
          'Perbarui informasi waktu, judul, narasi, atau tautan foto kenangan momen ini.',
        badgeLabel: 'Linimasa Aqiqah',
        iconType: 'sparkles',
        themeColorClass: {
          bg: 'bg-indigo-50',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
        },
      }

    case 'RASULAN':
      return {
        sectionTitle: `Linimasa Acara & Tradisi Rasulan (${count})`,
        sectionSubtitle:
          'Tambahkan rangkaian kegiatan, tradisi, dan momen tasyakuran rasulan / sedekah bumi (opsional).',
        kickerSubtitle: 'Kilas Balik',
        emptyTitle: 'Belum ada momen cerita yang ditambahkan.',
        emptySubtitle:
          'Gunakan formulir di bawah untuk menambahkan rangkaian tradisi, kirab budaya, atau momen tasyakuran bersama warga.',
        timePlaceholder: 'Contoh: Pagi Hari, 08:00 WIB, atau Hari Pertama',
        titlePlaceholder: 'Contoh: Bersih Dusun / Kirab Budaya / Doa Bersama Warga',
        storyPlaceholder:
          'Ceritakan rangkaian tradisi, kekompakan warga, atau jalannya acara rasulan...',
        addButtonLabel: 'Tambah Momen Acara',
        editModalTitle: 'Edit Momen Rasulan',
        editModalDescription:
          'Perbarui informasi waktu, judul, narasi, atau tautan foto kenangan momen ini.',
        badgeLabel: 'Linimasa Rasulan',
        iconType: 'sparkles',
        themeColorClass: {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
        },
      }

    case 'WEDDING':
    default:
      return {
        sectionTitle: `Kisah Cinta / Love Story (${count})`,
        sectionSubtitle:
          'Tambahkan rangkaian momen berkesan dan perjalanan cinta Anda berdua (opsional).',
        kickerSubtitle: 'Our Love Story',
        emptyTitle: 'Belum ada momen cerita yang ditambahkan.',
        emptySubtitle:
          'Gunakan formulir di bawah untuk menambahkan kisah awal bertemu, kencan pertama, atau momen lamaran.',
        timePlaceholder: 'Contoh: 2020, 15 Juni 2024, atau Usia 22 Tahun',
        titlePlaceholder: 'Contoh: Pertama Bertemu / Kencan Pertama / Momen Lamaran',
        storyPlaceholder: 'Ceritakan momen atau kisah penting pada babak perjalanan cinta ini...',
        addButtonLabel: 'Tambah Cerita / Momen',
        editModalTitle: 'Edit Cerita / Momen Cinta',
        editModalDescription:
          'Perbarui informasi waktu, judul, narasi cerita, atau tautan foto kenangan momen ini.',
        badgeLabel: 'Kisah Cinta',
        iconType: 'heart',
        themeColorClass: {
          bg: 'bg-pink-50',
          text: 'text-pink-600',
          border: 'border-pink-200',
        },
      }
  }
}

/**
 * Mendapatkan judul section linimasa/cerita berdasarkan kategori acara (Wedding, Khitanan, Aqiqah, Rasulan, dll).
 */
export function getStorySectionTitle(eventCategory?: ApiEventCategory | string | null): string {
  switch (eventCategory?.toUpperCase()) {
    case 'WEDDING':
      return 'Kisah Cinta Kami'
    case 'KHITAN':
    case 'KHITANAN':
      return 'Perjalanan Sang Buah Hati'
    case 'AQIQAH':
      return 'Momen Bahagia & Kelahiran'
    case 'RASULAN':
      return 'Linimasa Acara & Tradisi'
    default:
      return 'Linimasa Cerita'
  }
}

/**
 * Mendapatkan subjudul/kicker linimasa berdasarkan kategori acara.
 */
export function getStorySectionSubtitle(eventCategory?: ApiEventCategory | string | null): string {
  switch (eventCategory?.toUpperCase()) {
    case 'WEDDING':
      return 'Our Love Story'
    case 'KHITAN':
    case 'KHITANAN':
      return 'Milestone & Journey'
    case 'AQIQAH':
      return 'Momen Berharga'
    case 'RASULAN':
      return 'Kilas Balik'
    default:
      return 'Our Journey'
  }
}

