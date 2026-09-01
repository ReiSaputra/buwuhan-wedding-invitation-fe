# Catatan Deployment Frontend

## Masalah cookie refresh token lintas domain

Backend menyetel cookie `refreshToken` dengan `sameSite: "strict"` dan
`path: "/v1/api/auth"`. Cookie dengan `sameSite: strict` **tidak akan terkirim**
bila frontend dan backend berada di domain berbeda.

Pilih salah satu dari dua opsi berikut.

### Opsi A (disarankan) — satu domain, backend di belakang path

Contoh: frontend `https://buwuhan.com`, backend di `https://buwuhan.com/v1/api`
lewat reverse proxy (Nginx / Vercel rewrites / Cloudflare).

- `.env.production` → `VITE_API_BASE_URL=/v1/api`
- Konfigurasi backend tidak perlu diubah.

### Opsi B — domain terpisah

Contoh: frontend `https://buwuhan.com`, backend `https://api.buwuhan.com`.

- `.env.production` → `VITE_API_BASE_URL=https://api.buwuhan.com/v1/api`
- Backend **wajib** diubah di `src/modules/auth/auth.cookie.ts`:
  `sameSite: "none"` dan `secure: true` (hanya berlaku di atas HTTPS).
- Pastikan `FRONTEND_URL` di backend berisi origin frontend yang tepat agar
  CORS `credentials: true` diterima browser.

## Halaman undangan publik dan SPA fallback

Rute `/undangan/:slug` ditangani React Router di sisi klien. Server statis harus
mengarahkan semua permintaan ke `index.html` (SPA fallback), jika tidak tamu
akan menerima 404 dari server saat membuka tautan undangan langsung.