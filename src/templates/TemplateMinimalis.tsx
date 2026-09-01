import { TemplateShell } from '@/templates/TemplateShell'
import { THEME_MINIMALIS } from '@/templates/template-themes'
import type { TemplateProps } from '@/templates/template-props'

/** Template "Modern Minimalist" (slug backend: `modern-minimalist`). */
export default function TemplateMinimalis({ data }: TemplateProps) {
  return <TemplateShell data={data} theme={THEME_MINIMALIS} />
}