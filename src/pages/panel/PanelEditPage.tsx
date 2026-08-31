import { useParams } from 'react-router-dom'
import { Loader2, AlertCircle, Send, Archive, FileEdit, Check } from 'lucide-react'
import { InvitationForm } from '@/components/dashboard/InvitationForm'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import {
  useUpdateInvitation,
  useUpdateInvitationStatus,
} from '@/hooks/useInvitationMutations'
import type { ApiInvitationStatus, InvitationPayload } from '@/types/invitation-api'
import { cn } from '@/lib/cn'

const STATUS_OPTIONS: Array<{
  value: ApiInvitationStatus
  label: string
  hint: string
  icon: typeof Send
}> = [
  { value: 'DRAFT', label: 'Draft', hint: 'Belum dibagikan ke tamu', icon: FileEdit },
  { value: 'ACTIVE', label: 'Aktif', hint: 'Undangan dapat dibuka publik', icon: Send },
  { value: 'COMPLETED', label: 'Selesai', hint: 'Acara sudah berlangsung', icon: Archive },
]

/**
 * Halaman Edit Undangan pada panel per-undangan.
 * Memuat data undangan dari backend, menampilkannya di InvitationForm,
 * lalu menyimpan perubahan lewat PATCH /invitations/:id.
 * Menyediakan pula pengubah status publikasi lewat PATCH /invitations/:id/status.
 */
export default function PanelEditPage() {
  const { id = '' } = useParams()
  const { rawInvitation, isFound, isLoading } = useInvitationDetail(id)
  const updateInvitation = useUpdateInvitation(id)
  const updateStatus = useUpdateInvitationStatus(id)

  /**
   * Menyimpan perubahan data undangan.
   * Error dilempar kembali agar InvitationForm menampilkannya per kolom.
   */
  async function handleSubmit(payload: InvitationPayload) {
    await updateInvitation.mutateAsync(payload)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white p-12 text-xs text-muted shadow-xs">
        <Loader2 size={16} className="animate-spin text-primary" />
        <span>Memuat data undangan…</span>
      </div>
    )
  }

  if (!isFound || !rawInvitation) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-danger">
          <AlertCircle size={28} />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-ink">
          Undangan Tidak Ditemukan
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
          Undangan mungkin sudah dihapus, atau kamu tidak memiliki akses ke undangan ini.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Judul halaman */}
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Edit Undangan
        </h1>
        <p className="mt-1 text-xs text-muted">
          Perbarui data mempelai, tanggal, dan lokasi acara pernikahan.
        </p>
      </div>

      {/* Pengubah status publikasi */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Status Publikasi
        </p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {STATUS_OPTIONS.map((option) => {
            const isCurrent = rawInvitation.status === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                type="button"
                disabled={isCurrent || updateStatus.isPending}
                onClick={() => updateStatus.mutate(option.value)}
                className={cn(
                  'flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all',
                  isCurrent
                    ? 'border-primary bg-indigo-50/70 cursor-default'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 cursor-pointer',
                  updateStatus.isPending && 'opacity-60 pointer-events-none',
                )}
              >
                <Icon size={16} className={isCurrent ? 'text-primary' : 'text-slate-400'} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold text-ink">
                    {option.label}
                    {isCurrent && <Check size={13} className="text-primary" />}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{option.hint}</p>
                </div>
              </button>
            )
          })}
        </div>

        {updateStatus.isError && (
          <p className="mt-3 text-[11px] font-medium text-danger">
            Gagal mengubah status. Coba lagi.
          </p>
        )}
      </div>

      {/* Formulir data undangan */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs sm:p-6">
        {updateInvitation.isSuccess && !updateInvitation.isPending && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            Perubahan berhasil disimpan.
          </div>
        )}

        <InvitationForm
          initialValue={rawInvitation}
          onSubmit={handleSubmit}
          isSubmitting={updateInvitation.isPending}
        />
      </div>
    </div>
  )
}