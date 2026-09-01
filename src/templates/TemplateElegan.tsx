import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_ELEGAN } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Royal Floral" (slug backend: `royal-floral`). */
export default function TemplateElegan({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_ELEGAN} />
}