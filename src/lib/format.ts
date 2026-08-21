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