# 📋 Buwuhan Wedding Invitation — Frontend & Backend Sync Planning

Dokumen ini berfungsi sebagai **Single Source of Truth (SSOT)** untuk perencanaan pengembangan Frontend, arsitektur modul, kontrak API, serta protokol sinkronisasi perubahan antara **Frontend (FE)** dan **Backend (BE)**.

> **PANDUAN UTAMA**:
> Setiap kali ada fitur, komponen, atau alur kerja di Frontend yang memerlukan data baru, perubahan struktur payload, query params, atau endpoint baru, **wajib dicatat terlebih dahulu pada seksi [Log Sinkronisasi Perubahan FE ↔ BE](#-log-sinkronisasi-perubahan-fe--be)** agar tim Backend dapat menyelaraskan implementasi tanpa _breaking changes_.

---

## 📑 Daftar Isi

1. [Arsitektur & Modul Frontend](#1-arsitektur--modul-frontend)
2. [Standar Kontrak API Envelope](#2-standar-kontrak-api-envelope)
3. [Matriks Endpoint & Integrasi Modul](#3-matriks-endpoint--integrasi-modul)
4. [Protokol Sinkronisasi Perubahan FE ↔ BE](#4-protokol-sinkronisasi-perubahan-fe--be)
5. [Log Sinkronisasi Perubahan FE ↔ BE (Active & History)](#5-log-sinkronisasi-perubahan-fe--be)
6. [Roadmap & Status Fitur](#6-roadmap--status-fitur)

---

## 1. Arsitektur & Modul Frontend

### 1.1 Struktur Direktori Utama

```text
src/
├── components/          # Komponen modular yang dapat digunakan kembali
│   ├── auth/            # Guard route (ProtectedRoute, AdminRoute)
│   ├── dashboard/       # Sidebar, Topbar, StatCard, NavItem, Breadcrumb
│   ├── langganan/       # PlanCard, PricingTable, CheckoutModal
│   ├── panel/           # Modul spesifik undangan (Header, Form, Guest, Buwuh, dll)
│   └── ui/              # Atom UI (Button, Modal, Input, ImageUrlInput, Badge)
├── config/              # Konfigurasi navigasi & preset tema
├── hooks/               # Custom hooks & TanStack Query integrations
├── layouts/             # DashboardLayout, PanelLayout, AdminLayout
├── lib/                 # Instance Axios (api.ts), formatters, sanitizers
├── pages/               # Halaman routing (Auth, Dashboard, Panel, Admin, Public)
├── sections/            # Section dinamis website undangan publik
├── templates/           # Preset layout & tema undangan
└── types/               # TypeScript interface & API DTO contracts
```

### 1.2 Hirarki Rute & Hak Akses

1. **Public Routes**:
   - Landing page / Public Wedding Invitation (`/undangan/:slug`)
   - Autentikasi (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`)
2. **Dashboard User (`/dashboard`)**:
   - Ikhtisar Beranda (`/dashboard`)
   - Daftar Undangan & Pembuatan Baru (`/dashboard/undangan`)
   - Catatan Buwuh Global (`/dashboard/buwuh`)
   - Langganan Paket (`/dashboard/langganan`)
   - Pengaturan Akun & Keamanan (`/dashboard/pengaturan`)
3. **Panel Pengelolaan Undangan Spesifik (`/dashboard/undangan/:id`)**:
   - Beranda Panel (`/dashboard/undangan/:id`)
   - Edit Data Acara & Mempelai (`/dashboard/undangan/:id/edit`)
   - Pilih Desain & Tema Template (`/dashboard/undangan/:id/template`)
   - Manajemen Daftar Tamu (`/dashboard/undangan/:id/tamu`)
   - Konfirmasi Kehadiran Tamu / RSVP (`/dashboard/undangan/:id/rsvp`)
   - Buku Tamu & Ucapan Doa (`/dashboard/undangan/:id/buku-tamu`)
   - Manajemen Hadiah & Rekening Digital (`/dashboard/undangan/:id/hadiah`)
   - Catatan Buwuh & Sumbangan (`/dashboard/undangan/:id/buwuh`)
   - Live Check-in / Scan QR (`/dashboard/undangan/:id/scan`)
   - Tim & Petugas Resepsi (`/dashboard/undangan/:id/petugas`)
4. **Portal Superadmin (`/admin`)**:
   - Overview Metrik Platform (`/admin/dashboard`)
   - Manajemen Pengguna (`/admin/users`, `/admin/users/:id`)
   - Monitoring Seluruh Undangan (`/admin/invitations`)
   - Template Store & Katalog (`/admin/templates`)
   - Transaksi & Langganan (`/admin/subscriptions`)
   - Pengaturan Sistem & Gateway (`/admin/settings`)

---

## 2. Standar Kontrak API Envelope

Semua komunikasi antara Frontend dan Backend wajib menggunakan format Envelope JSON yang konsisten.

### 2.1 Respons Sukses (HTTP 200, 201)

```typescript
interface BackendSuccessEnvelope<T> {
  success: true;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### 2.2 Respons Gagal / Galat (HTTP 400, 401, 403, 404, 422, 500)

```typescript
interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors?: Record<string, string[]> | Array<{ field: string; message: string }>;
  statusCode: number;
}
```

---

## 3. Matriks Endpoint & Integrasi Modul

| Modul         | Method   | Endpoint                           | Fungsi                                        | Status FE | Status BE |
| :------------ | :------- | :--------------------------------- | :-------------------------------------------- | :-------- | :-------- |
| **Auth**      | `POST`   | `/auth/login`                      | Login user & set cookie refresh token         | ✅ Ready  | ✅ Ready  |
| **Auth**      | `POST`   | `/auth/register`                   | Pendaftaran akun baru                         | ✅ Ready  | ✅ Ready  |
| **Auth**      | `POST`   | `/auth/refresh`                    | Silent refresh token untuk access token baru  | ✅ Ready  | ✅ Ready  |
| **Auth**      | `POST`   | `/auth/logout`                     | Revoke token dan hapus cookie                 | ✅ Ready  | ✅ Ready  |
| **Dashboard** | `GET`    | `/dashboard/summary`               | Ringkasan metrik statistik user               | ✅ Ready  | ✅ Ready  |
| **Undangan**  | `GET`    | `/invitations`                     | Mengambil daftar undangan milik user          | ✅ Ready  | ✅ Ready  |
| **Undangan**  | `POST`   | `/invitations`                     | Membuat draft undangan baru                   | ✅ Ready  | ✅ Ready  |
| **Undangan**  | `GET`    | `/invitations/:id`                 | Detail data lengkap undangan                  | ✅ Ready  | ✅ Ready  |
| **Undangan**  | `PATCH`  | `/invitations/:id`                 | Memperbarui data mempelai, acara, cerita      | ✅ Ready  | ✅ Ready  |
| **Tamu**      | `GET`    | `/invitations/:id/guests`          | Daftar tamu undangan dengan pagination        | ✅ Ready  | ✅ Ready  |
| **Tamu**      | `POST`   | `/invitations/:id/guests`          | Tambah tamu undangan (single / bulk)          | ✅ Ready  | ✅ Ready  |
| **Tamu**      | `PATCH`  | `/invitations/:id/guests/:guestId` | Update info tamu                              | ✅ Ready  | ✅ Ready  |
| **Tamu**      | `DELETE` | `/invitations/:id/guests/:guestId` | Hapus tamu                                    | ✅ Ready  | ✅ Ready  |
| **RSVP**      | `GET`    | `/invitations/:id/rsvp`            | Rekap kehadiran & konfirmasi tamu             | ✅ Ready  | ✅ Ready  |
| **Hadiah**    | `GET`    | `/invitations/:id/gift-accounts`   | Daftar rekening & QRIS hadiah                 | ✅ Ready  | ✅ Ready  |
| **Hadiah**    | `POST`   | `/invitations/:id/gift-accounts`   | Tambah / simpan konfigurasi rekening          | ✅ Ready  | ✅ Ready  |
| **Buwuh**     | `GET`    | `/invitations/:id/buwuh`           | Catatan buwuh/amplop per undangan             | ✅ Ready  | ✅ Ready  |
| **Buwuh**     | `POST`   | `/invitations/:id/buwuh`           | Catat amplop / sumbangan fisik & transfer     | ✅ Ready  | ✅ Ready  |
| **Check-in**  | `POST`   | `/invitations/:id/checkin`         | Check-in tamu via pemindaian QR code          | ✅ Ready  | ✅ Ready  |
| **Petugas**   | `GET`    | `/invitations/:id/members`         | Daftar tim / panitia penerima tamu            | ✅ Ready  | ✅ Ready  |
| **Petugas**   | `POST`   | `/invitations/:id/members`         | Undang petugas via email / hak akses          | ✅ Ready  | ✅ Ready  |
| **Upload**    | `POST`   | `/uploads/images`                  | Upload berkas gambar (multipart/form-data)    | ✅ Ready  | ✅ Ready  |
| **Langganan** | `GET`    | `/subscriptions/plans`             | Daftar paket & harga langganan                | ✅ Ready  | ✅ Ready  |
| **Langganan** | `POST`   | `/subscriptions/checkout`          | Inisiasi pembayaran paket via payment gateway | ✅ Ready  | ✅ Ready  |
| **Admin**     | `GET`    | `/admin/stats`                     | Statistik global platform Superadmin          | ✅ Ready  | ✅ Ready  |
| **Admin**     | `GET`    | `/admin/users`                     | Daftar seluruh user terdaftar                 | ✅ Ready  | ✅ Ready  |

---

## 4. Protokol Sinkronisasi Perubahan FE ↔ BE

Untuk menjaga kompatibilitas penuh dan menghindari _breaking changes_, ikuti langkah-langkah berikut ketika terjadi perubahan:

### Langkah 1: Registrasi Kebutuhan di Dokumen ini

1. Beri ID perubahan baru, contoh: `SYNC-001`.
2. Jelaskan komponen FE yang meminta perubahan dan latar belakang kebutuhan.
3. Rincikan spesifikasi endpoint baru / modifikasi payload yang diinginkan.

### Langkah 2: Skema Fallback & Backward Compatibility di Frontend

- Frontend wajib menyiapkan penanganan data `undefined` / `null` atau fallback nilai default jika Backend belum men-deploy perubahan tersebut.
- Gunakan optional chaining (`?.`) dan nullish coalescing (`??`).

### Langkah 3: Koordinasi & Pengujian

- Jalankan validasi pada branch staging / development backend.
- Verifikasi status response code dan format envelope.
- Perbarui status di tabel log dari `⏳ Pending BE` menjadi `✅ Synchronized`.

---

## 5. Log Sinkronisasi Perubahan FE ↔ BE

Tabel ini wajib diperbarui setiap kali ada penyesuaian di sisi Frontend yang berdampak langsung atau tidak langsung ke integrasi Backend:

| ID Sync      | Tanggal    | Modul / Komponen FE                                               | Detail Perubahan Frontend                                                                                                                                                                                                                                                                                       | Dampak & Kebutuhan Backend                                                                                                                                                                                             | Status          |
| :----------- | :--------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| **SYNC-001** | 2026-09-10 | `ImageUrlInput` & `GalleryManager`                                | Perluasan tipe prop `folder` (`images`, `qris`, `gallery`, `string`) untuk upload foto album.                                                                                                                                                                                                                   | Pastikan endpoint `POST /uploads/images` menerima multipart form-data dengan field `folder: "gallery"` dan menyimpannya di direktori/bucket yang sesuai.                                                               | ✅ Synchronized |
| **SYNC-002** | 2026-09-10 | `BerandaPage` & `PanelHeader`                                     | Penghapusan badge pill dekoratif (_"Panel Manajemen Undangan Digital"_, _"Panel Acara Pernikahan"_).                                                                                                                                                                                                            | Tidak ada perubahan schema API (murni penyederhanaan UI).                                                                                                                                                              | ✅ Synchronized |
| **SYNC-003** | 2026-09-10 | `LanggananPage` & `AdminLayout`                                   | Penghapusan badge pill _"Investasi Terbaik untuk Momen Bahagia"_ dan _"Portal Kontrol Platform"_.                                                                                                                                                                                                               | Tidak ada dampak ke DTO/endpoint backend.                                                                                                                                                                              | ✅ Synchronized |
| **SYNC-004** | 2026-09-10 | `Sidebar` & `ScanQrCta`                                           | Penghapusan subtitle _"Wedding SaaS"_, box konteks _"Panel: {nama}"_, tag _"Resepsi Live"_, dan animasi ping amber dot.                                                                                                                                                                                         | Prop `subtitle` di sidebar kini opsional/tidak wajib dirender.                                                                                                                                                         | ✅ Synchronized |
| **SYNC-005** | _Upcoming_ | `PanelHadiahPage`                                                 | Integrasi gateway amplop digital otomatis (QRIS dinamis / VA).                                                                                                                                                                                                                                                  | Endpoint webhook status `POST /payments/webhook` dan query riwayat amplop `GET /invitations/:id/gifts/history`.                                                                                                        | ⏳ Planned      |
| **SYNC-006** | _Upcoming_ | `ExportGuestListModal`                                            | Ekspor rekap data buku tamu & buwuh ke format Excel (.xlsx) dan PDF.                                                                                                                                                                                                                                            | Endpoint streaming berkas `GET /invitations/:id/export?format=xlsx`.                                                                                                                                                   | ⏳ Planned      |
| **SYNC-007** | 2026-09-10 | `PanelCatatanBuwuhPage`, `BuwuhanFormModal`, `BuwuhanDetailModal` | **Overhaul UI tabel Catatan Buwuh:** (1) Note text wrap, (2) Kolom "Jenis Bantuan" → "Alamat Pemberi" (`giverAddress`), (3) Ikon kategori tanpa teks label di rincian bantuan, (4) "Estimasi Nilai" → "Nominal Uang" (hanya hitung item Uang), (5) Format tanggal kompak 2 baris `DD-MM-YY` dan `HH:mm:ss WIB`. | Kolom `giver_address` (text, nullable) di tabel `buwuhan` telah aktif. Endpoint `GET/POST/PATCH /invitations/:id/buwuhans` dan `/buwuhans/:id` menerima dan mengirim field `giverAddress`.                             | ✅ Synchronized |
| **SYNC-008** | 2026-09-12 | `BuwuhPage`, `useStandaloneBuwuhan`                               | **Pemisahan Catatan Buwuh Mandiri (Dashboard):** Halaman `/dashboard/buwuh` menjadi modul mandiri khusus bagi user tanpa undangan digital (terpisah total dari kelola undangan, tanpa kolom Acara Undangan, dengan aksi CRUD dan ekspor CSV).                                                                   | Kolom `invitation_id` di tabel `buwuhan` **nullable**. Endpoint `GET /buwuhans/standalone` & `POST /buwuhans/standalone` sudah aktif berbasis `user_id` dari JWT. Edit & hapus tetap via `PATCH/DELETE /buwuhans/:id`. | ✅ Synchronized |
| **SYNC-009** | 2026-09-22 | `PanelPetugasPage`, `useMembers`                                  | **Fitur Ubah Status Petugas (Aktif ↔ Pasif / Tugas Selesai):** Tambahkan aksi ubah status petugas hari-H jadi pasif (revoked) tanpa menghapus akun/riwayat audit buwuhan, filter status aktif/pasif, dan indikator status pada modal edit. | Endpoint `PATCH /invitations/:invitationId/members/:id` diperluas menerima `{ role?: InvitationRole, isRevoked?: boolean, status?: "ACTIVE" \| "REVOKED" \| "PASIF" }`. Jika `isRevoked: true`, `revokedAt` diisi timestamp; jika `false`, di-reset ke `null`. | ✅ Synchronized |

---

## 6. Roadmap & Status Fitur

### ✅ Selesai (Completed)

- [x] Autentikasi JWT in-memory + refresh token cookie aman
- [x] Dashboard utama pengguna & metrik ringkasan
- [x] Panel manajemen undangan (Edit mempelai, acara, galeri, kisah cinta)
- [x] Modul Buku Tamu, RSVP Kehadiran, Hadiah, dan Catatan Buwuh
- [x] Scan QR Code live check-in tamu resepsi
- [x] Manajemen petugas penerima tamu per-undangan
- [x] Portal Superadmin terintegrasi (Pengguna, Undangan, Template, Pengaturan)
- [x] UI/UX Clean Polish (Pembersihan badge redundan)

### 🚀 Dalam Pengerjaan (In Progress)

- [ ] Pengujian integrasi Webhook Payment Gateway (Langganan & Amplop)
- [ ] Optimasi caching query tamu dengan filter kompleks (Kategori & Status Kehadiran)
- [ ] Peningkatan laporan ekspor CSV/XLSX catatan buwuh

---

_Dokumen ini diperbarui secara berkala sesuai siklus sprint dan pembaruan arsitektur aplikasi._
