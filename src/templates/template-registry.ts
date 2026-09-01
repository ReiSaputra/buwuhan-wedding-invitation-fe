/**
 * Registry slug template dari backend.
 *
 * Slug di sini WAJIB sama dengan kolom `slug` pada tabel `templates`
 * (lihat `prisma/seed.ts` di repo backend). Slug bersifat kontrak publik
 * dan tidak boleh diubah sembarangan.
 *
 * Sengaja tidak menyimpan komponen React di dalam objek ini karena aturan
 * lint `react-hooks/static-components` melarang komponen disimpan sebagai
 * nilai objek. Pemetaan ke JSX dilakukan lewat `switch` di TemplateRenderer.
 */
export const TEMPLATE_SLUGS = [
  'royal-floral',
  'modern-minimalist',
  'javanese-classic',
  'khitanan-ceria-blue',
  'rasulan-syukuran-gold',
] as const

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number]

/** Slug yang dipakai bila undangan belum memilih template atau slug tidak dikenal. */
export const FALLBACK_TEMPLATE_SLUG: TemplateSlug = 'royal-floral'

/**
 * Memeriksa apakah sebuah slug dari backend sudah didukung frontend.
 */
export function isKnownTemplateSlug(slug: string | null | undefined): slug is TemplateSlug {
  return TEMPLATE_SLUGS.includes(slug as TemplateSlug)
}

/**
 * Menormalkan slug dari backend menjadi slug yang pasti punya komponen.
 * Saat slug belum dikenal, beri peringatan di mode development agar
 * penambahan template baru di backend tidak lolos tanpa disadari.
 */
export function resolveTemplateSlug(slug: string | null | undefined): TemplateSlug {
  if (isKnownTemplateSlug(slug)) return slug

  if (import.meta.env.DEV && slug) {
    console.warn(
      `[TemplateRenderer] Slug template "${slug}" belum punya komponen di frontend. ` +
        `Menggunakan fallback "${FALLBACK_TEMPLATE_SLUG}". ` +
        `Tambahkan slug ini ke src/templates/template-registry.ts dan TemplateRenderer.tsx.`
    )
  }

  return FALLBACK_TEMPLATE_SLUG
}