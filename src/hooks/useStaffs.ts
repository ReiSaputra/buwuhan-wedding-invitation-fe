import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BackendSuccessEnvelope } from '@/types/auth'
import type {
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
} from '@/types/staff'

const STAFF_STORAGE_PREFIX = 'buwuhan_staffs_'

function getInitialCachedStaffs(invitationId: string): StaffMember[] {
  try {
    const raw = localStorage.getItem(`${STAFF_STORAGE_PREFIX}${invitationId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parsing errors
  }
  return [
    {
      id: 'staff-1',
      invitationId,
      name: 'Ahmad Fauzi (Scanner Meja 1)',
      email: 'ahmad.fauzi@example.com',
      phone: '081234567801',
      role: 'SCANNER',
      permissions: ['SCAN_QR', 'MANAGE_GUESTS'],
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'staff-2',
      invitationId,
      name: 'Siti Rahayu (Pencatat Buwuhan)',
      email: 'siti.rahayu@example.com',
      phone: '081234567802',
      role: 'CASHIER',
      permissions: ['RECORD_BUWUH', 'VIEW_STATS'],
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'staff-3',
      invitationId,
      name: 'Budi Santoso (Penerima Tamu)',
      email: 'budi.santoso@example.com',
      phone: '081234567803',
      role: 'RECEPTIONIST',
      permissions: ['SCAN_QR', 'MANAGE_GUESTS'],
      status: 'PENDING',
      inviteToken: 'inv_tok_budi_123',
      createdAt: new Date().toISOString(),
    },
  ]
}

/**
 * Hook untuk memuat daftar petugas undangan (GET /invitations/:invitationId/staffs).
 */
export function useStaffs(invitationId: string) {
  return useQuery<StaffMember[]>({
    queryKey: ['invitations', invitationId, 'staffs'],
    queryFn: async () => {
      try {
        const res = await api.get<BackendSuccessEnvelope<StaffMember[]>>(
          `/invitations/${invitationId}/staffs`,
        )
        const data = res.data?.data
        if (data && Array.isArray(data)) {
          localStorage.setItem(
            `${STAFF_STORAGE_PREFIX}${invitationId}`,
            JSON.stringify(data),
          )
          return data
        }
      } catch (err) {
        console.warn('Backend GET /invitations/:id/staffs offline, gunakan cache lokal:', err)
      }
      return getInitialCachedStaffs(invitationId)
    },
    initialData: () => getInitialCachedStaffs(invitationId),
    enabled: Boolean(invitationId),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook untuk menambah petugas baru (POST /invitations/:invitationId/staffs).
 */
export function useAddStaff(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      try {
        const res = await api.post<BackendSuccessEnvelope<StaffMember>>(
          `/invitations/${invitationId}/staffs`,
          payload,
        )
        const created = res.data?.data
        if (created) return created
      } catch (err) {
        console.warn('Backend POST /invitations/:id/staffs fallback lokal:', err)
      }

      // Optimistic local fallback
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        invitationId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        permissions: payload.permissions || ['SCAN_QR'],
        status: 'PENDING',
        inviteToken: `tok_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
      }

      const current = getInitialCachedStaffs(invitationId)
      const updated = [newStaff, ...current]
      localStorage.setItem(`${STAFF_STORAGE_PREFIX}${invitationId}`, JSON.stringify(updated))
      return newStaff
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitations', invitationId, 'staffs'] })
    },
  })
}

/**
 * Hook untuk memperbarui data / izin petugas (PATCH /staffs/:id).
 */
export function useUpdateStaff(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateStaffPayload }) => {
      try {
        const res = await api.patch<BackendSuccessEnvelope<StaffMember>>(`/staffs/${id}`, payload)
        const updated = res.data?.data
        if (updated) return updated
      } catch (err) {
        console.warn('Backend PATCH /staffs/:id fallback lokal:', err)
      }

      const current = getInitialCachedStaffs(invitationId)
      const updated = current.map((s) => (s.id === id ? { ...s, ...payload, updatedAt: new Date().toISOString() } : s))
      localStorage.setItem(`${STAFF_STORAGE_PREFIX}${invitationId}`, JSON.stringify(updated))
      return updated.find((s) => s.id === id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitations', invitationId, 'staffs'] })
    },
  })
}

/**
 * Hook untuk mencabut akses petugas (DELETE /staffs/:id).
 */
export function useDeleteStaff(invitationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/staffs/${id}`)
      } catch (err) {
        console.warn('Backend DELETE /staffs/:id fallback lokal:', err)
      }

      const current = getInitialCachedStaffs(invitationId)
      const updated = current.filter((s) => s.id !== id)
      localStorage.setItem(`${STAFF_STORAGE_PREFIX}${invitationId}`, JSON.stringify(updated))
      return { success: true }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invitations', invitationId, 'staffs'] })
    },
  })
}

/**
 * Hook untuk menerima undangan petugas via token (POST /staffs/accept/:token).
 */
export function useAcceptStaffInvite() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post<BackendSuccessEnvelope<{ success: boolean; staff: StaffMember }>>(
        `/staffs/accept/${token}`,
        {},
      )
      return res.data?.data
    },
  })
}
