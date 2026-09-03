import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData } from '@/lib/api'
import type {
  GuestShareData,
  SendEmailResponse,
  BulkSendEmailResponse,
} from '@/types/invitation-api'

/**
 * Hook pengelola aksi berbagi undangan (WhatsApp) dan pengiriman email ke tamu (single & bulk).
 *
 * Endpoint:
 * - GET  /invitations/:invitationId/guests/:guestId/share
 * - POST /invitations/:invitationId/guests/:guestId/send-email
 * - POST /invitations/:invitationId/guests/send-email-bulk
 */
export function useGuestActions(invitationId: string) {
  const queryClient = useQueryClient()

  /**
   * Mengambil data tautan dan teks format pesan WhatsApp untuk satu tamu.
   */
  async function getGuestShareData(guestId: string): Promise<GuestShareData> {
    return fetchData<GuestShareData>(`/invitations/${invitationId}/guests/${guestId}/share`)
  }

  /**
   * Mutasi untuk mengirimkan undangan via email ke satu tamu.
   */
  const sendEmailMutation = useMutation({
    mutationFn: (guestId: string) =>
      postData<SendEmailResponse, Record<string, never>>(
        `/invitations/${invitationId}/guests/${guestId}/send-email`,
        {},
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId, 'guests'] })
    },
  })

  /**
   * Mutasi untuk mengirimkan undangan via email ke banyak tamu secara massal (Bulk/Broadcast).
   */
  const sendEmailBulkMutation = useMutation({
    mutationFn: (guestIds?: string[]) =>
      postData<BulkSendEmailResponse, { guestIds?: string[] }>(
        `/invitations/${invitationId}/guests/send-email-bulk`,
        guestIds && guestIds.length > 0 ? { guestIds } : {},
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId, 'guests'] })
    },
  })

  return {
    getGuestShareData,
    sendEmail: sendEmailMutation.mutateAsync,
    isSendingEmail: sendEmailMutation.isPending,
    sendEmailError: sendEmailMutation.error,
    sendEmailBulk: (guestIds?: string[]) => sendEmailBulkMutation.mutateAsync(guestIds),
    isSendingEmailBulk: sendEmailBulkMutation.isPending,
    sendEmailBulkError: sendEmailBulkMutation.error,
  }
}

