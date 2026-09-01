/**
 * Mengambil token QR tamu dari hasil pemindaian.
 * Menerima token mentah maupun URL undangan berformat `...?to=<qrCode>`.
 *
 * @param raw - Teks mentah hasil scan kamera atau input manual
 * @returns Token qrCode bersih, atau string kosong bila tidak valid
 */
export function extractQrCode(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  try {
    const url = new URL(value)
    return url.searchParams.get('to')?.trim() ?? ''
  } catch {
    // Bukan URL -> anggap token mentah
    return value
  }
}