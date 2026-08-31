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
 * Modal dialog untuk membuat undangan pernikahan baru.
 * Membungkus InvitationForm dan menyimpan data lewat POST /invitations.
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
   * Error sengaja TIDAK ditangkap di sini agar dilempar kembali ke
   * InvitationForm dan ditampilkan pada kolom yang bersangkutan.
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
      description="Isi data mempelai dan detail acara. Template tema dapat dipilih setelah undangan tersimpan."
      maxWidth="2xl"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <InvitationForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={createInvitation.isPending}
        />
      </div>
    </Modal>
  )
}