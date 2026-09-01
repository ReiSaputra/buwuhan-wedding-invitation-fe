import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_SYUKURAN } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Rasulan Syukuran Gold" (slug backend: `rasulan-syukuran-gold`). */
export default function TemplateSyukuran({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_SYUKURAN} />
}