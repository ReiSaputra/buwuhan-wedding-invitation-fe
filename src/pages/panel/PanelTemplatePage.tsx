import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Eye, LayoutTemplate, Lock } from 'lucide-react'
import { patchData } from '@/lib/api'
import { QueryState } from '@/components/common/QueryState'
import { Badge } from '@/components/ui/Badge'
import { TemplatePreviewModal } from '@/components/panel/TemplatePreviewModal'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useTemplates } from '@/hooks/useTemplates'
import type { ApiInvitation } from '@/types/invitation-api'
import { cn } from '@/lib/cn'

/**
 * Halaman Pilih Template pada Panel Pengelolaan Undangan.
 * Menampilkan seluruh template dari backend dan menyimpan pilihan pengguna
 * lewat PATCH /invitations/:id dengan hanya mengirim ruas templateId.
 */
export default function PanelTemplatePage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const { rawInvitation } = useInvitationDetail(id)
  const { templates, isLoading, isError } = useTemplates()

  const activeTemplateId = rawInvitation?.template?.id ?? ''

  // Slug template yang sedang dipratinjau lewat GET /templates/:slug
  const [previewSlug, setPreviewSlug] = useState<string | null>(null)

  // Mutation lokal dipakai karena useUpdateInvitation mewajibkan payload penuh
  // (title, slug, couples), sedangkan di sini cukup mengirim templateId saja.
  const selectTemplate = useMutation({
    mutationFn: (templateId: string) =>
      patchData<ApiInvitation, { templateId: string }>(`/invitations/${id}`, { templateId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitation', id] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Pilih Desain Template
        </h1>
        <p className="mt-1 text-xs text-muted">
          Tentukan tampilan undangan digital yang akan dilihat tamu Anda.
        </p>
      </div>

      {selectTemplate.isError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-danger">
          Gagal menyimpan pilihan template. Coba lagi.
        </p>
      )}

      <QueryState isLoading={isLoading} isError={isError}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isActive = template.id === activeTemplateId
            const isLocked = !template.isAccessible

            return (
              <div
                key={template.id}
                className={cn(
                  'group overflow-hidden rounded-3xl border bg-white text-left transition-all',
                  isActive
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-slate-300',
                  selectTemplate.isPending && 'pointer-events-none opacity-60',
                )}
              >
                <div className="relative aspect-4/3 bg-slate-100">
                  {template.previewImageUrl ? (
                    <img
                      src={template.previewImageUrl}
                      alt={`Pratinjau template ${template.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <LayoutTemplate
                      size={28}
                      className="absolute inset-0 m-auto text-slate-300"
                    />
                  )}

                  {isActive && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
                      <Check size={12} /> Terpakai
                    </span>
                  )}

                  {isLocked && !isActive && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-xl bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
                      <Lock size={11} /> {template.tier}
                    </span>
                  )}

                  {/* Tombol pratinjau memanggil GET /templates/:slug */}
                  <button
                    type="button"
                    onClick={() => setPreviewSlug(template.slug)}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/30 group-hover:opacity-100"
                    aria-label={`Pratinjau ${template.name}`}
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-ink shadow-sm">
                      <Eye size={12} /> Pratinjau
                    </span>
                  </button>
                </div>

                <div className="space-y-2 p-4">
                  <p className="text-xs font-bold text-ink">{template.name}</p>

                  <Badge variant={template.tier === 'FREE' ? 'default' : 'primary'}>
                    {template.tier === 'FREE' ? 'Gratis' : `Paket ${template.tier}`}
                  </Badge>

                  <button
                    type="button"
                    disabled={isActive || isLocked || selectTemplate.isPending}
                    onClick={() => selectTemplate.mutate(template.id)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2 text-[11px] font-bold transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-primary'
                        : isLocked
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                          : 'cursor-pointer bg-ink text-white hover:bg-slate-800',
                    )}
                  >
                    {isActive
                      ? 'Sedang Dipakai'
                      : isLocked
                        ? `Perlu Paket ${template.tier}`
                        : 'Pakai Template Ini'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </QueryState>

      {previewSlug && (
        <TemplatePreviewModal
          slug={previewSlug}
          isActive={
            templates.find((t) => t.slug === previewSlug)?.id === activeTemplateId
          }
          isSelecting={selectTemplate.isPending}
          onClose={() => setPreviewSlug(null)}
          onSelect={(templateId) => {
            selectTemplate.mutate(templateId)
            setPreviewSlug(null)
          }}
        />
      )}
    </div>
  )
}