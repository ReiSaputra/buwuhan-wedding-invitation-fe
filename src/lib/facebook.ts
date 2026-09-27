import { FACEBOOK_APP_ID } from '@/config/auth'

/**
 * Membangun URL otorisasi Facebook OAuth standar (Authorization Code Grant).
 * Menggunakan endpoint dialog resmi Meta: https://www.facebook.com/v19.0/dialog/oauth
 */
export function getFacebookOAuthUrl(): string {
  const appId = FACEBOOK_APP_ID?.trim()

  if (!appId) {
    throw new Error(
      'VITE_FACEBOOK_APP_ID belum diisi pada file .env di frontend (buwuhan-wedding-invitation-fe/.env).'
    )
  }

  const redirectUri = `${window.location.origin}/auth/facebook/callback`
  const state = Math.random().toString(36).substring(2, 15)
  try {
    sessionStorage.setItem('fb_oauth_state', state)
  } catch {
    // Abaikan jika storage dinonaktifkan
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: 'email,public_profile',
    auth_type: 'rerequest',
    display: 'page',
  })

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}

/**
 * Melakukan pengalihan langsung ke halaman otorisasi resmi Facebook OAuth.
 * Setelah pengguna memberikan izin, Facebook otomatis mengembalikan ke /auth/facebook/callback.
 */
export function redirectToFacebookOAuth(): void {
  const url = getFacebookOAuthUrl()
  window.location.href = url
}
