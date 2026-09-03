import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { InvitationForm } from './InvitationForm'
import { useCreateInvitation } from '@/hooks/useInvitationMutations'
import type { InvitationPayload } from '@/types/invitation-api'

export type CreateInvitationModalProps = {
  /** Menentukan apakah modal sedang terbuka */
  isOpen: boolean
  /** Callback untuk menutup modal */
  onClose: () => void
  /** Mengarahkan ke panel undangan setelah berhasil dibuat */
  redirectAfterCreate?: boolean
}

/**
 * Modal dialog untuk membuat undangan baru (Pernikahan, Khitanan/Rasulan, atau Undangan Lainnya).
 * Menampilkan pemilihan jenis undangan terlebih dahulu sebelum mengisi formulir.
 *
 * @example
 * <CreateInvitationModal isOpen={open} onClose={() => setOpen(false)} />
 */
export function CreateInvitationModal({
  isOpen,
  onClose,
  redirectAfterCreate = true,
}: CreateInvitationModalProps) {
  const navigate = useNavigate()
  const createInvitation = useCreateInvitation()

  /**
   * Mengirim data undangan baru ke backend.
   * Error dilempar kembali ke InvitationForm untuk ditampilkan per kolom input.
   */
  async function handleSubmit(payload: InvitationPayload) {
    const created = await createInvitation.mutateAsync(payload)
    onClose()
    if (redirectAfterCreate) {
      navigate(`/dashboard/undangan/${created.id}`)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Undangan Baru"
      description="Pilih jenis undangan, lengkapi detail acara, dan publikasikan undangan Anda."
      maxWidth="2xl"
    >
      <div className="max-h-[72vh] overflow-y-auto pr-1">
        <InvitationForm
          key={String(isOpen)}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={createInvitation.isPending}
        />
      </div>
    </Modal>
  )
}