import dayjs from 'dayjs'
import 'dayjs/locale/id'

// Mengaktifkan pelokalan Bahasa Indonesia untuk seluruh pemformatan tanggal
dayjs.locale('id')

/**
 * Memformat angka nominal menjadi string mata uang Rupiah Indonesia (IDR).
 * 
 * @param value - Nilai angka yang akan diformat (misal: 50000)
 * @returns String format Rupiah (misal: "Rp 50.000")
 * 
 * @example
 * formatRupiah(49000) // -> "Rp 49.000"
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Memformat angka bulat menggunakan pemisah ribuan standar Indonesia (titik).
 * 
 * @param value - Nilai angka yang akan diformat (misal: 1240)
 * @returns String format angka berpemisah (misal: "1.240")
 * 
 * @example
 * formatNumber(1240) // -> "1.240"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

/**
 * Menghitung sisa hari menuju tanggal target (countdown hari).
 * 
 * @param targetDateStr - String tanggal target dalam format YYYY-MM-DD
 * @returns Jumlah hari tersisa (positif jika di masa depan, negatif jika telah berlalu)
 */
export function getDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  const diffTime = target - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Memformat tanggal ISO menjadi tanggal singkat Bahasa Indonesia.
 *
 * @param iso - Tanggal dalam format ISO-8601
 * @returns String tanggal singkat (misal: "18 Jan 2026")
 *
 * @example
 * formatDateId('2026-01-18T14:30:00+07:00') // -> "18 Jan 2026"
 */
export function formatDateId(iso: string): string {
  return dayjs(iso).format('D MMM YYYY')
}

/**
 * Memformat waktu ISO menjadi jam berlabel WIB.
 *
 * Catatan: dayjs membaca waktu memakai zona perangkat pengguna. Untuk tamu
 * yang membuka dari luar WIB, label ini perlu diganti konversi zona eksplisit.
 *
 * @param iso - Waktu dalam format ISO-8601
 * @returns String jam (misal: "14:30 WIB")
 */
export function formatTimeWib(iso: string): string {
  return `${dayjs(iso).format('HH:mm')} WIB`
}

/**
 * Mengambil huruf pertama sebuah nama untuk dipakai sebagai avatar inisial.
 *
 * @param name - Nama lengkap tamu
 * @returns Satu huruf kapital, atau "?" bila nama kosong
 */
export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}
