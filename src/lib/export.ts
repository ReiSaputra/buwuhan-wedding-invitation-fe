import { api } from '@/lib/api'

/**
 * Mengunduh data tabel sebagai berkas CSV di sisi klien (Client-side Fallback).
 *
 * Menggunakan pemisah titik-koma (;) dan BOM UTF-8 karena Excel versi Indonesia
 * membaca koma sebagai pemisah desimal, bukan pemisah kolom.
 *
 * @param filename - Nama berkas hasil unduhan, misal "buku-tamu.csv"
 * @param rows - Baris data. Kunci objek pertama dipakai sebagai judul kolom.
 */
export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number | null | undefined>>,
): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])

  /** Membungkus nilai dengan tanda kutip bila mengandung karakter pemisah. */
  function escapeCell(value: unknown): string {
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

  // \ufeff = BOM, penanda agar Excel mengenali encoding UTF-8
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })

  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

/**
 * Utilitas untuk mengunduh objek Blob sebagai file di browser pengguna.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Mengunduh laporan ekspor data tamu & buku tamu dari peladen backend.
 * (GET /invitations/:id/guests/export?format=xlsx|csv)
 */
export async function exportGuestsData(
  invitationId: string,
  format: 'xlsx' | 'csv' = 'xlsx',
  fallbackRows?: Array<Record<string, string | number | null | undefined>>,
): Promise<void> {
  const filename = `daftar-tamu-${invitationId}.${format}`
  try {
    const response = await api.get(`/invitations/${invitationId}/guests/export`, {
      params: { format },
      responseType: 'blob',
    })
    const mimeType =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
    const blob = new Blob([response.data], { type: mimeType })
    downloadBlob(blob, filename)
  } catch (err) {
    console.warn('Backend export endpoint offline, menjalankan client-side CSV export:', err)
    if (fallbackRows && fallbackRows.length > 0) {
      downloadCsv(`daftar-tamu-${invitationId}.csv`, fallbackRows)
    } else {
      throw err
    }
  }
}

/**
 * Mengunduh laporan ekspor konfirmasi kehadiran (RSVP) dari peladen.
 * (GET /invitations/:id/rsvps/export?format=xlsx|csv)
 */
export async function exportRsvpData(
  invitationId: string,
  format: 'xlsx' | 'csv' = 'xlsx',
  fallbackRows?: Array<Record<string, string | number | null | undefined>>,
): Promise<void> {
  const filename = `laporan-rsvp-${invitationId}.${format}`
  try {
    const response = await api.get(`/invitations/${invitationId}/rsvps/export`, {
      params: { format },
      responseType: 'blob',
    })
    const mimeType =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
    const blob = new Blob([response.data], { type: mimeType })
    downloadBlob(blob, filename)
  } catch (err) {
    console.warn('Backend RSVP export offline, menggunakan client fallback:', err)
    if (fallbackRows && fallbackRows.length > 0) {
      downloadCsv(`laporan-rsvp-${invitationId}.csv`, fallbackRows)
    } else {
      throw err
    }
  }
}

/**
 * Mengunduh laporan rekapitulasi catatan buwuhan & amplop masuk.
 * (GET /invitations/:id/buwuhans/export?format=xlsx|csv)
 */
export async function exportBuwuhanData(
  invitationId: string,
  format: 'xlsx' | 'csv' = 'xlsx',
  fallbackRows?: Array<Record<string, string | number | null | undefined>>,
): Promise<void> {
  const filename = `catatan-buwuh-${invitationId}.${format}`
  try {
    const response = await api.get(`/invitations/${invitationId}/buwuhans/export`, {
      params: { format },
      responseType: 'blob',
    })
    const mimeType =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
    const blob = new Blob([response.data], { type: mimeType })
    downloadBlob(blob, filename)
  } catch (err) {
    console.warn('Backend Buwuhan export offline, menggunakan client fallback:', err)
    if (fallbackRows && fallbackRows.length > 0) {
      downloadCsv(`catatan-buwuh-${invitationId}.csv`, fallbackRows)
    } else {
      throw err
    }
  }
}

/**
 * Mengunduh laporan rekapitulasi semua undangan platform untuk Superadmin.
 * (GET /admin/invitations/export?format=xlsx|csv)
 */
export async function exportAdminInvitationsData(
  format: 'xlsx' | 'csv' = 'xlsx',
  fallbackRows?: Array<Record<string, string | number | null | undefined>>,
): Promise<void> {
  const filename = `rekap-undangan-buwuhan-${new Date().toISOString().slice(0, 10)}.${format}`
  try {
    const response = await api.get('/admin/invitations/export', {
      params: { format },
      responseType: 'blob',
    })
    const mimeType =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
    const blob = new Blob([response.data], { type: mimeType })
    downloadBlob(blob, filename)
  } catch (err) {
    console.warn('Backend Admin export offline, menggunakan client fallback:', err)
    if (fallbackRows && fallbackRows.length > 0) {
      downloadCsv(filename, fallbackRows)
    } else {
      throw err
    }
  }
}
