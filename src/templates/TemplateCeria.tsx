import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_CERIA } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Khitanan Ceria Blue" (slug backend: `khitanan-ceria-blue`). */
export default function TemplateCeria({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_CERIA} />
}