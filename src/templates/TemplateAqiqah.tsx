import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_AQIQAH } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Aqiqah Lembut Mint" (slug backend: `aqiqah-lembut-mint`). */
export default function TemplateAqiqah({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_AQIQAH} />
}