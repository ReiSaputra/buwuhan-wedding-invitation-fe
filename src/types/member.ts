/**
 * Peran anggota undangan — HARUS sama persis dengan enum InvitationRole di backend.
 */
export type InvitationRole = 'OWNER' | 'ADMIN' | 'USER'

/**
 * Status turunan (tidak ada kolomnya di database, dihitung dari acceptedAt/revokedAt).
 */
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'REVOKED'

/**
 * Bentuk MemberItemData dari backend (member.types.ts baris 17-31).
 */
export interface Member {
  id: string
  invitationId: string
  userId: string | null
  email: string
  name: string
  role: InvitationRole
  invitedAt: string
  acceptedAt: string | null
  revokedAt: string | null
  isAccepted: boolean
  isRevoked: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMemberPayload {
  email: string
  name: string
  role?: InvitationRole
}

export interface UpdateMemberPayload {
  role?: InvitationRole
  isRevoked?: boolean
  status?: MemberStatus
}

export type UpdateMemberRolePayload = UpdateMemberPayload

export interface AcceptInviteResult {
  memberId: string
  invitationId: string
  invitationSlug: string
  invitationTitle: string
  role: InvitationRole
}

export interface ResendInviteResult {
  memberId: string
  email: string
  name: string
}

/**
 * Menurunkan status tampilan dari flag yang dikirim backend.
 */
export function getMemberStatus(member: Member): MemberStatus {
  if (member.isRevoked) return 'REVOKED'
  if (member.isAccepted) return 'ACTIVE'
  return 'PENDING'
}