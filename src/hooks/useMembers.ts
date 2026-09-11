import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type {
  AcceptInviteResult,
  CreateMemberPayload,
  InvitationRole,
  Member,
  ResendInviteResult,
} from '@/types/member'

export interface InstantLinkPayload {
  name: string
  role?: 'ADMIN' | 'USER'
}

export interface InstantLinkResult {
  memberId: string
  name: string
  role: 'ADMIN' | 'USER'
  accessLink: string
  expiresAt: string
}

export interface InstantAccessResult {
  sessionToken: string
  member: {
    id: string
    name: string
    role: 'ADMIN' | 'USER'
  }
  invitation: {
    id: string
    title: string
    slug: string
  }
}

const membersKey = (invitationId: string) => ['members', invitationId] as const

/**
 * GET /invitations/:invitationId/members
 */
export function useMembers(invitationId?: string) {
  return useQuery({
    queryKey: membersKey(invitationId ?? ''),
    queryFn: () => fetchData<Member[]>(`/invitations/${invitationId}/members`),
    enabled: Boolean(invitationId),
  })
}

/**
 * GET /invitations/:invitationId/members/:id
 */
export function useMemberDetail(invitationId?: string, memberId?: string) {
  return useQuery({
    queryKey: ['members', invitationId ?? '', memberId ?? ''],
    queryFn: () =>
      fetchData<Member>(`/invitations/${invitationId}/members/${memberId}`),
    enabled: Boolean(invitationId && memberId),
  })
}

/**
 * POST /invitations/:invitationId/members — hanya OWNER.
 * Backend langsung mengirim email undangan berisi token.
 */
export function useInviteMember(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMemberPayload) =>
      postData<Member, CreateMemberPayload>(
        `/invitations/${invitationId}/members`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(invitationId) })
    },
  })
}

/**
 * POST /invitations/:invitationId/members/:id/resend
 */
export function useResendMemberInvite(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) =>
      postData<ResendInviteResult, Record<string, never>>(
        `/invitations/${invitationId}/members/${memberId}/resend`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(invitationId) })
    },
  })
}

/**
 * PATCH /invitations/:invitationId/members/:id — hanya OWNER.
 */
export function useUpdateMemberRole(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: InvitationRole }) =>
      patchData<Member, { role: InvitationRole }>(
        `/invitations/${invitationId}/members/${memberId}`,
        { role },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(invitationId) })
    },
  })
}

/**
 * DELETE /invitations/:invitationId/members/:id — hanya OWNER.
 */
export function useRemoveMember(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) =>
      deleteData(`/invitations/${invitationId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(invitationId) })
    },
  })
}

/**
 * POST /members/accept — dipakai halaman /dashboard/undangan/join.
 */
export function useAcceptMemberInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) =>
      postData<AcceptInviteResult, { token: string }>('/members/accept', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

/**
 * POST /invitations/:invitationId/members/instant-link — hanya OWNER.
 * Membuat tautan akses cepat (Magic Link) untuk petugas tanpa perlu email.
 */
export function useGenerateInstantLink(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InstantLinkPayload) =>
      postData<InstantLinkResult, InstantLinkPayload>(
        `/invitations/${invitationId}/members/instant-link`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(invitationId) })
    },
  })
}

/**
 * POST /members/instant-access — Publik.
 * Menukar token magic link menjadi sesi JWT petugas tanpa akun.
 */
export function useInstantMemberAccess() {
  return useMutation({
    mutationFn: (token: string) =>
      postData<InstantAccessResult, { token: string }>('/members/instant-access', { token }),
  })
}