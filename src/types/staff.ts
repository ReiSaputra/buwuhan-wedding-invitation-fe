/**
 * Peran bawaan petugas acara
 */
export type StaffRole = 'SCANNER' | 'RECEPTIONIST' | 'CASHIER' | 'COORDINATOR' | 'ADMIN'

/**
 * Hak akses granular yang dapat diberikan kepada petugas
 */
export type StaffPermission =
  | 'SCAN_QR'
  | 'MANAGE_GUESTS'
  | 'RECORD_BUWUH'
  | 'VIEW_STATS'
  | 'MANAGE_SETTINGS'

export type StaffStatus = 'ACTIVE' | 'PENDING' | 'REVOKED'

/**
 * Model data anggota petugas undangan
 */
export interface StaffMember {
  id: string
  invitationId: string
  name: string
  email: string
  phone?: string
  role: StaffRole
  permissions: StaffPermission[]
  status: StaffStatus
  inviteToken?: string
  inviteUrl?: string
  createdAt: string
  updatedAt?: string
}

/**
 * Payload untuk menambah petugas baru di POST /invitations/:invitationId/staffs
 */
export interface CreateStaffPayload {
  name: string
  email: string
  phone?: string
  role: StaffRole
  permissions?: StaffPermission[]
}

/**
 * Payload untuk memperbarui peran/izin petugas di PATCH /staffs/:id
 */
export interface UpdateStaffPayload {
  name?: string
  phone?: string
  role?: StaffRole
  permissions?: StaffPermission[]
  status?: StaffStatus
}
