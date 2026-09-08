import TemplateKlasik from '@/templates/TemplateKlasik'
import TemplateElegan from '@/templates/TemplateElegan'
import TemplateMinimalis from '@/templates/TemplateMinimalis'
import TemplateCeria from '@/templates/TemplateCeria'
import TemplateSyukuran from '@/templates/TemplateSyukuran'
import TemplateAqiqah from '@/templates/TemplateAqiqah'
import type { PublicInvitationViewModel } from '@/types/invitation-api'

export type TemplateRendererProps = {
  /** Nilai `data.template.slug` dari response API. Null/'' bila belum memilih template. */
  slug: string | null
  /** Seluruh data undangan publik, diteruskan sebagai props ke komponen template. */
  data: PublicInvitationViewModel
}

/**
 * Memilih komponen JSX template berdasarkan slug template dari backend.
 *
 * Cara menambah template baru:
 *   1. Tambah tema di `template-themes.ts`
 *   2. Buat `TemplateXxx.tsx` berisi 3 baris pemanggil TemplateShell
 *   3. Tambah satu blok `else if` di bawah
 */
export function TemplateRenderer({ slug, data }: TemplateRendererProps) {
  if (slug === 'javanese-classic') {
    return <TemplateKlasik data={data} />
  } else if (slug === 'royal-floral') {
    return <TemplateElegan data={data} />
  } else if (slug === 'modern-minimalist') {
    return <TemplateMinimalis data={data} />
  } else if (slug === 'khitanan-ceria-blue') {
    return <TemplateCeria data={data} />
  } else if (slug === 'rasulan-syukuran-gold') {
  return <TemplateSyukuran data={data} />
} else if (slug === 'aqiqah-lembut-mint') {
  return <TemplateAqiqah data={data} />
} else {
    if (slug) {
      console.warn(
        `[TemplateRenderer] Slug "${slug}" belum punya komponen. ` +
          `Tambahkan blok else if di src/templates/TemplateRenderer.tsx`
      )
    }
    return <TemplateElegan data={data} />
  }
}