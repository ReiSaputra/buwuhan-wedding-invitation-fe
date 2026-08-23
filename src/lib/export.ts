/**
 * Mengunduh data tabel sebagai berkas CSV yang siap dibuka di Microsoft Excel.
 *
 * Menggunakan pemisah titik-koma (;) dan BOM UTF-8 karena Excel versi Indonesia
 * membaca koma sebagai pemisah desimal, bukan pemisah kolom.
 *
 * @param filename - Nama berkas hasil unduhan, misal "buku-tamu.csv"
 * @param rows - Baris data. Kunci objek pertama dipakai sebagai judul kolom.
 *
 * @example
 * downloadCsv('buku-tamu.csv', [{ Nama: 'Budi', Status: 'Hadir' }])
 */
export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number>>,
): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])

  /** Membungkus nilai dengan tanda kutip bila mengandung karakter pemisah. */
  function escapeCell(value: string | number): string {
    const text = String(value ?? '')
    if (/[";\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const lines = [
    headers.join(';'),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(';')),
  ]

  // \ufeff = BOM, penanda agar Excel mengenali encoding UTF-8 (huruf beraksen aman)
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
