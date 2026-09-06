import type { GuestPayload } from '@/types/invitation-api'

export type ParsedGuestRow = {
  line: number
  raw: string
  payload?: GuestPayload
  error?: string
}

const PHONE_RE = /^[0-9+ -]{6,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Mem-parse teks tempel/CSV menjadi daftar payload tamu.
 * Format per baris: Nama, Kategori, Nomor HP, Email, Jumlah Pax, Keterangan
 * Hanya kolom pertama (Nama) yang wajib. Pemisah: koma, titik-koma, atau tab.
 */
export function parseGuestText(text: string): ParsedGuestRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const rows: ParsedGuestRow[] = []

  lines.forEach((raw, index) => {
    const line = index + 1

    // Lewati baris header CSV
    if (index === 0 && /^nama\b/i.test(raw)) return

    const cells = raw.split(/[;\t]|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.trim().replace(/^"|"$/g, ''))
    const [name, category, phone, email, paxCount, notes] = cells

    if (!name) {
      rows.push({ line, raw, error: 'Nama tamu wajib diisi' })
      return
    }
    if (name.length > 255) {
      rows.push({ line, raw, error: 'Nama maksimal 255 karakter' })
      return
    }
    if (phone && !PHONE_RE.test(phone)) {
      rows.push({ line, raw, error: `Format nomor telepon tidak valid: ${phone}` })
      return
    }
    if (email && !EMAIL_RE.test(email)) {
      rows.push({ line, raw, error: `Format email tidak valid: ${email}` })
      return
    }

    const pax = paxCount ? Number(paxCount) : undefined
    if (pax !== undefined && (!Number.isInteger(pax) || pax < 1 || pax > 100)) {
      rows.push({ line, raw, error: 'Jumlah pax harus angka 1-100' })
      return
    }

    rows.push({
      line,
      raw,
      payload: {
        name,
        category: category || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        ...(pax !== undefined ? { paxCount: pax } : {}),
      },
    })
  })

  return rows
}

/** Batas maksimal tamu per satu kali import (mengikuti validasi backend). */
export const MAX_BULK_GUESTS = 500

/** Contoh isian untuk placeholder textarea & template CSV. */
export const GUEST_IMPORT_EXAMPLE =
  'Nama, Kategori, Nomor HP, Email, Pax, Keterangan\nBudi Santoso, Keluarga, 081234567890, budi@mail.com, 2, Sepupu\nSiti Aminah, Rekan Kerja, 081298765432, , 1,'