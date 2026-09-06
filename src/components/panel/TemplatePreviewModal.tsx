import { Check, Crown, Loader2, Lock, LayoutTemplate, ServerCrash } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTemplateDetail } from '@/hooks/useTemplates'

const CATEGORY_LABEL: Record<string, string> = {
  WEDDING: 'Pernikahan',
  KHITANAN: 'Khitanan',
  RASULAN: 'Rasulan',
  AQIQAH: 'Aqiqah',
}

export type TemplatePreviewModalProps = {
  /** Slug template yang dipratinjau. Komponen ini hanya dirender saat slug ada. */
  slug: string
  /** true bila template ini yang sedang dipakai undangan */
  isActive: boolean
  isSelecting?: boolean
  onClose: () => void
  onSelect: (templateId: string) => void
}

/**
 * Modal pratinjau satu template, datanya diambil langsung lewat
 * GET /templates/:slug sehingga selalu mencerminkan kondisi terbaru
 * (termasuk hak akses tier) tanpa memuat ulang seluruh katalog.
 */
export function TemplatePreviewModal({
  slug,
  isActive,
  isSelecting = false,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  const { template, isLoading, isError } = useTemplateDetail(slug)

  return (
    <Modal isOpen onClose={onClose} title="Pratinjau Template" maxWidth="lg">
      <>
        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="space-y-3 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
              <p className="text-xs font-medium text-slate-400">Memuat template…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="max-w-xs space-y-2 text-center">
              <ServerCrash size={24} className="mx-auto text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">
                Template tidak ditemukan
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Template ini mungkin sudah dinonaktifkan oleh admin. Muat ulang halaman
                untuk menyegarkan daftar.
              </p>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-1">
                Tutup
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && template && (
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100">
              {template.previewImageUrl ? (
                <img
                  src={template.previewImageUrl}
                  alt={`Pratinjau template ${template.name}`}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <LayoutTemplate
                  size={32}
                  className="absolute inset-0 m-auto text-slate-300"
                />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                {template.name}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={template.tier === 'FREE' ? 'default' : 'primary'}>
                  {template.tier === 'FREE' ? 'Gratis' : `Paket ${template.tier}`}
                </Badge>
                <Badge variant="outline">
                  {CATEGORY_LABEL[template.eventCategory] ?? template.eventCategory}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {template.slug}
                </Badge>
              </div>

              {!template.isAccessible && (
                <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Template ini termasuk paket <b>{template.tier}</b>. Tingkatkan langganan
                    Anda untuk memakainya.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>

              {isActive ? (
                <Badge variant="success" icon={<Check size={12} />}>
                  Sedang Dipakai
                </Badge>
              ) : template.isAccessible ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSelecting}
                  onClick={() => onSelect(template.id)}
                >
                  {isSelecting ? 'Menyimpan…' : 'Pakai Template Ini'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled
                  className="inline-flex items-center gap-1.5"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Perlu Paket {template.tier}
                </Button>
              )}
            </div>
          </div>
        )}
      </>
    </Modal>
  )
}