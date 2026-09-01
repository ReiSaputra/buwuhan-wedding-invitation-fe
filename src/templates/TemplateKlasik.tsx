import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_KLASIK } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Javanese Classic" (slug backend: `javanese-classic`). */
export default function TemplateKlasik({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_KLASIK} />
}