import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type {
  AdminDashboardStats,
  AdminInvitationDetail,
  AdminInvitationsResponse,
  AdminInvitationQueryParams,
  AdminTemplate,
  AdminTemplateQueryParams,
  AdminTemplatesResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  AdminUser,
  AdminUserDetail,
  AdminUserQueryParams,
  AdminUsersResponse,
  InvitationStatus,
  PlanTier,
  UserRole,
} from '@/types/admin'

/**
 * Mengambil ringkasan statistik platform global secara real-time.
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetchData<AdminDashboardStats>('/admin/dashboard/stats'),
    staleTime: 30000,
  })
}

/**
 * Mengambil daftar pengguna platform dengan paginasi, pencarian, dan filter.
 */
export function useAdminUsers(params: AdminUserQueryParams = {}) {
  const { page = 1, limit = 10, search = '', role = 'ALL', planTier = 'ALL' } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (search.trim()) queryParams.set('search', search.trim())
  if (role !== 'ALL') queryParams.set('role', role)
  if (planTier !== 'ALL') queryParams.set('planTier', planTier)

  return useQuery({
    queryKey: ['admin', 'users', { page, limit, search, role, planTier }],
    queryFn: () =>
      fetchData<AdminUsersResponse>(`/admin/users?${queryParams.toString()}`),
  })
}

/**
 * Mengambil detail profil dan audit riwayat undangan milik pengguna tertentu.
 */
export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchData<AdminUserDetail>(`/admin/users/${userId}`),
    enabled: Boolean(userId),
  })
}

/**
 * Mutasi untuk memperbarui paket langganan (tier) pengguna.
 */
export function useUpdateUserTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, planTier }: { userId: string; planTier: PlanTier }) =>
      patchData<AdminUser, { planTier: PlanTier }>(`/admin/users/${userId}/tier`, {
        planTier,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/**
 * Mutasi untuk mengubah role pengguna (promosi / demosi admin).
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      patchData<AdminUser, { role: UserRole }>(`/admin/users/${userId}/role`, {
        role,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/**
 * Mutasi untuk mencabut seluruh sesi login aktif pengguna (paksa logout).
 */
export function useRevokeUserSessions() {
  return useMutation({
    mutationFn: (userId: string) =>
      postData<{ userId: string; revokedCount: number }, Record<string, never>>(
        `/admin/users/${userId}/revoke-sessions`,
        {},
      ),
  })
}

/**
 * Mutasi untuk menghapus pengguna secara permanen (cascade delete).
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteData(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/**
 * Mengambil daftar seluruh undangan di platform dengan filter status & kategori.
 */
export function useAdminInvitations(params: AdminInvitationQueryParams = {}) {
  const { page = 1, limit = 10, search = '', status = 'ALL', eventCategory = 'ALL' } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (search.trim()) queryParams.set('search', search.trim())
  if (status !== 'ALL') queryParams.set('status', status)
  if (eventCategory !== 'ALL') queryParams.set('eventCategory', eventCategory)

  return useQuery({
    queryKey: ['admin', 'invitations', { page, limit, search, status, eventCategory }],
    queryFn: () =>
      fetchData<AdminInvitationsResponse>(`/admin/invitations?${queryParams.toString()}`),
  })
}

/**
 * Mengambil detail lengkap satu undangan untuk keperluan moderasi konten.
 * Berbeda dengan daftar, respons ini menyertakan data mempelai, galeri foto,
 * kisah cinta, dan informasi tambahan.
 *
 * @param invitationId - ID undangan; null membuat query tidak dijalankan
 */
export function useAdminInvitationDetail(invitationId: string | null) {
  return useQuery({
    queryKey: ['admin', 'invitations', 'detail', invitationId],
    queryFn: () => fetchData<AdminInvitationDetail>(`/admin/invitations/${invitationId}`),
    enabled: Boolean(invitationId),
    retry: false, // 404/403 tidak perlu diulang
  })
}

/**
 * Mutasi untuk mengubah status moderasi undangan (misal takedown ke DRAFT).
 */
export function useUpdateInvitationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: string
      status: InvitationStatus
    }) =>
      patchData<{ id: string; status: InvitationStatus }, { status: InvitationStatus }>(
        `/admin/invitations/${invitationId}/status`,
        { status },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/**
 * Mengambil seluruh katalog template platform (aktif maupun terarsip).
 */
export function useAdminTemplates(params: AdminTemplateQueryParams = {}) {
  const { page = 1, limit = 12, isActive = 'ALL', tier = 'ALL', eventCategory = 'ALL', search = '' } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (isActive !== 'ALL') queryParams.set('isActive', String(isActive))
  if (tier !== 'ALL') queryParams.set('tier', tier)
  if (eventCategory !== 'ALL') queryParams.set('eventCategory', eventCategory)
  if (search.trim()) queryParams.set('search', search.trim())

  return useQuery({
    queryKey: ['admin', 'templates', { page, limit, isActive, tier, eventCategory, search }],
    queryFn: () =>
      fetchData<AdminTemplatesResponse>(`/admin/templates?${queryParams.toString()}`),
  })
}

/**
 * Mutasi untuk menambah template baru ke katalog (POST /templates, admin-only).
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      postData<AdminTemplate, CreateTemplatePayload>('/templates', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      // Katalog yang dilihat pengguna biasa juga ikut berubah
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Mutasi untuk mengubah data template yang sudah ada (PATCH /templates/:id).
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      patchData<AdminTemplate, UpdateTemplatePayload>(`/templates/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * Mutasi untuk memulihkan kembali template yang terarsip (restore).
 */
export function useRestoreTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) =>
      patchData<{ id: string; name: string; isActive: boolean }, Record<string, never>>(
        `/admin/templates/${templateId}/restore`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/**
 * Mutasi untuk menonaktifkan / soft-delete template.
 */
export function useDeactivateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) => deleteData(`/templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}
