/**
 * KONFIGURASI MANUAL — AMPLOP DIGITAL
 *
 * Data rekening dan alamat kado belum tersimpan di backend karena database
 * belum memiliki tabel untuk itu. Sampai fitur tersebut dibuat, isi data di
 * bawah ini secara manual sebelum membagikan tautan undangan.
 *
 * Biarkan GIFT_ACCOUNTS sebagai array kosong dan GIFT_ADDRESS sebagai string
 * kosong bila fitur amplop digital tidak ingin ditampilkan sama sekali.
 */

export type GiftAccount = {
  /** Nama bank atau penyedia dompet digital */
  bankName: string
  /** Nomor rekening atau nomor telepon dompet digital */
  accountNumber: string
  /** Nama pemilik rekening sesuai buku tabungan */
  accountHolder: string
  /** Keterangan singkat, contoh: 'Mempelai Pria' */
  type: string
}

/** Daftar rekening penerima amplop digital. */
export const GIFT_ACCOUNTS: GiftAccount[] = []

/** Alamat pengiriman kado fisik. Kosongkan bila tidak menerima kado fisik. */
export const GIFT_ADDRESS = ''