import type { InstantAccessMetadata } from '@/hooks/useMembers'
import type { ApiInvitation } from '@/types/invitation-api'

const KEYS = {
  IS_INSTANT: 'buwuhan_is_instant_access',
  TOKEN: 'buwuhan_instant_token',
  ACCESS: 'buwuhan_instant_access',
  INVITATION: 'buwuhan_instant_invitation',
  MEMBER_ID: 'buwuhan_current_member_id',
  MEMBER_NAME: 'buwuhan_current_member_name',
} as const

// Bersihkan data lama dari localStorage agar tidak mengontaminasi tab lain tempat akun utama aktif
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    Object.values(KEYS).forEach((k) => {
      window.localStorage.removeItem(k)
    })
  } catch {
    // Abaikan jika localStorage dibatasi oleh kebijakan browser
  }
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

/**
 * Pengelola penyimpanan sesi petugas instan (Magic Link).
 * Menggunakan sessionStorage agar sesi petugas terisolasi HANYA pada tab yang membuka link
 * dan TIDAK menimpa atau bocor ke tab lain tempat pemilik akun (Owner) sedang aktif.
 */
export const instantAuthStorage = {
  isInstantAccess(): boolean {
    const storage = getSessionStorage()
    return storage?.getItem(KEYS.IS_INSTANT) === 'true'
  },

  getToken(): string | null {
    const storage = getSessionStorage()
    return storage?.getItem(KEYS.TOKEN) ?? null
  },

  getMemberId(): string | null {
    const storage = getSessionStorage()
    return storage?.getItem(KEYS.MEMBER_ID) ?? null
  },

  getMemberName(): string | null {
    const storage = getSessionStorage()
    return storage?.getItem(KEYS.MEMBER_NAME) ?? null
  },

  getAccess(): InstantAccessMetadata | null {
    const storage = getSessionStorage()
    const raw = storage?.getItem(KEYS.ACCESS)
    if (!raw) return null
    try {
      return JSON.parse(raw) as InstantAccessMetadata
    } catch {
      return null
    }
  },

  getInvitation(): Partial<ApiInvitation> | null {
    const storage = getSessionStorage()
    const raw = storage?.getItem(KEYS.INVITATION)
    if (!raw) return null
    try {
      return JSON.parse(raw) as Partial<ApiInvitation>
    } catch {
      return null
    }
  },

  setSession(data: {
    token: string
    memberId: string
    memberName: string
    access?: InstantAccessMetadata
    invitation?: { id: string; title: string; slug: string }
  }): void {
    const storage = getSessionStorage()
    if (!storage) return

    storage.setItem(KEYS.IS_INSTANT, 'true')
    storage.setItem(KEYS.TOKEN, data.token)
    storage.setItem(KEYS.MEMBER_ID, data.memberId)
    storage.setItem(KEYS.MEMBER_NAME, data.memberName)
    if (data.access) {
      storage.setItem(KEYS.ACCESS, JSON.stringify(data.access))
    }
    if (data.invitation) {
      storage.setItem(KEYS.INVITATION, JSON.stringify(data.invitation))
    }

    // Bersihkan juga dari localStorage jika ada sisa sesi lama
    if (typeof window !== 'undefined') {
      Object.values(KEYS).forEach((k) => {
        window.localStorage.removeItem(k)
      })
    }
  },

  clearSession(): void {
    const storage = getSessionStorage()
    if (storage) {
      Object.values(KEYS).forEach((k) => storage.removeItem(k))
    }
    if (typeof window !== 'undefined') {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k))
    }
  },
}
