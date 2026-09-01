import type { PublicInvitationViewModel } from '@/types/invitation-api'

/**
 * Props standar setiap komponen template undangan.
 * Semua template menerima data undangan lewat satu objek `data`,
 * sehingga komponen bersifat presentational dan tidak terikat routing.
 */
export type TemplateProps = {
  data: PublicInvitationViewModel
}