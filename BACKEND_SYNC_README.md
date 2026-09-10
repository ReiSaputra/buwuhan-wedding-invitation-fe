# 🔄 Dokumentasi Sinkronisasi Menyeluruh FE ↔ BE (Audit & Issue Sync)

| Informasi | Keterangan |
| :--- | :--- |
| **Status Audit** | 🔍 Audit Sinkronisasi Komprehensif Selesai |
| **Tanggal Audit** | 11 September 2026 |
| **Modul Terkait** | Seluruh Modul (Auth, Undangan, Tamu, RSVP, Buwuhan, Hadiah, Langganan, Admin, Media) |
| **Tujuan Dokumen** | Memetakan perbedaan fitur antara Frontend dan Backend agar kedua tim selaras |

## 📊 Matriks Status Sinkronisasi Antar Repositori

### 🔴 Bagian 1: Ada di Frontend, Namun BELUM TERSEDIA di Backend

Berikut adalah fitur/field yang sudah diimplementasikan di sisi Frontend (dengan fallback aktif) dan menunggu implementasi di Backend:

| No | Modul | Fitur / Endpoint / Field | Deskripsi Kebutuhan Backend | Prioritas |
| :-: | :--- | :--- | :--- | :-: |
| 1 | **Buwuhan** | Field `giverAddress` | Tambah kolom `giver_address TEXT NULL` di tabel `buwuhan` & sertakan di DTO GET/POST/PATCH. | 🔴 Tinggi |
| 2 | **Buwuhan** | Endpoint Standalone (`/buwuhans/standalone`) | Rute `GET` & `POST /buwuhans/standalone` untuk catatan mandiri (jadikan `invitation_id` nullable). | 🔴 Tinggi |
| 3 | **Ekspor** | Endpoint Streaming Export (`/export?format=xlsx\|csv`) | Endpoint streaming laporan Excel/CSV untuk Tamu, RSVP, Buwuhan, dan Admin Invitations. | 🟡 Sedang |

### 🔵 Bagian 2: Ada di Backend, Namun BELUM DIGUNAKAN di Frontend

Berikut adalah endpoint yang telah dibuat di Backend namun belum dihubungkan secara optimal di Frontend:

| No | Modul | Endpoint Backend | Kegunaan / Potensi Pemanfaatan di Frontend | Catatan FE |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **RSVP** | `GET /public/invitations/:slug/wishes` | Mengambil daftar ucapan doa/selamat saja secara terpisah dari data undangan. | FE saat ini memuat ucapan dari nested data undangan. |
| 2 | **Tamu** | `GET /public/invitations/:slug/guests/verify/:qrCode` | Verifikasi QR tiket tamu secara publik tanpa memerlukan token login petugas. | Bisa dipakai untuk portal cek tiket publik/kiosk tamu. |
| 3 | **Anggota** | `GET /invitations/:invitationId/members/:id` | Mengambil data satu anggota panitia secara individual. | FE saat ini cukup menggunakan data dari query list anggota. |

### 🟢 Bagian 3: Sudah Sinkron Sepenuhnya (Synchronized)

| Modul | Endpoint / Fitur | Status Sinkronisasi |
| :--- | :--- | :-: |
| **Autentikasi** | Login, Register, Refresh Token (Cookie httpOnly), Logout | ✅ Sinkron |
| **Pengguna** | Profil Saya (`GET /users/me`) | ✅ Sinkron |
| **Undangan** | CRUD Undangan, Update Status, Galeri Foto, Love Story | ✅ Sinkron |
| **Tamu** | CRUD Tamu, Bulk Create, Check-in/Check-out QR, Send Email Tamu, Share Info | ✅ Sinkron |
| **RSVP** | Submit RSVP Publik, List RSVP Panitia, Statistik Kehadiran | ✅ Sinkron |
| **Hadiah** | Akun Rekening Pengantin (Gift Accounts) & Riwayat Hadiah Masuk (Gifts) | ✅ Sinkron |
| **Petugas** | Kelola Panitia Undangan (`/members`), Kirim Undangan, Update Role, Resend Invite | ✅ Sinkron |
| **Langganan** | Paket Langganan (`/plans`), Status Aktif (`/subscriptions/me`), Checkout, Invoices | ✅ Sinkron |
| **Superadmin** | Manajemen Pengguna (Tier, Role, Revoke Session, Delete), Monitoring Undangan, Template, Langganan | ✅ Sinkron |
| **Upload Media** | Router Upload Gambar Multipart (`POST /uploads/images`) dengan folder `images` & `qris` | ✅ Sinkron |

## 📋 Rincian Detail Issue yang Perlu Tindakan Backend

### 🔴 ISSUE-SYNC-01: Penambahan Field `giverAddress` pada Catatan Buwuh

**Kebutuhan Database & API:**
- Tabel `buwuhan`: Tambahkan kolom `giver_address TEXT NULL DEFAULT NULL`.
- Endpoint `GET /invitations/:id/buwuhans`, `GET /buwuhans/:id`, `GET /buwuhans`: Sertakan `giverAddress` (string | null).
- Endpoint `POST /invitations/:id/buwuhans`, `PATCH /buwuhans/:id`: Terima `giverAddress` pada request body.

Contoh Payload:
```jsonc
{
  "giverName": "Bpk. Sutrisno",
  "giverAddress": "Ds. Kedungwaru, Kec. Tulungagung",
  "note": "Titipan keluarga besar",
  "items": [
    {
      "itemName": "Uang Tunai / Amplop",
      "quantity": 1,
      "unit": "transaksi",
      "category": "Uang",
      "estimatedValue": 100000
    }
  ]
}
```

### 🔴 ISSUE-SYNC-02: Endpoint Catatan Buwuh Mandiri / Standalone

**Kebutuhan Database & API:**
- Tabel `buwuhan`: Ubah kolom `invitation_id` menjadi `NULLABLE`.
- Endpoint Baru:
  - `GET /buwuhans/standalone` — Mengambil catatan buwuh mandiri milik user login (`invitation_id IS NULL AND user_id = req.user.id`).
  - `POST /buwuhans/standalone` — Membuat catatan buwuh mandiri baru.
  - `PATCH /buwuhans/:id` — Mengubah catatan.
  - `DELETE /buwuhans/:id` — Menghapus catatan.
- Frontend sudah menyediakan fallback penyimpanan `localStorage` otomatis.

### 🟡 ISSUE-SYNC-03: Endpoint Streaming Ekspor Berkas Server-Side

**Kebutuhan Endpoint Streaming:**
- `GET /invitations/:id/guests/export?format=xlsx|csv` (Laporan Buku Tamu)
- `GET /invitations/:id/rsvps/export?format=xlsx|csv` (Laporan Konfirmasi RSVP)
- `GET /invitations/:id/buwuhans/export?format=xlsx|csv` (Laporan Rekap Catatan Buwuh)
- `GET /admin/invitations/export?format=xlsx|csv` (Laporan Rekap Seluruh Undangan untuk Superadmin)

Response Type: `blob` / `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` atau `text/csv`.  
*Catatan:* Frontend sudah menyediakan client-side fallback generator jika endpoint server belum tersedia.

### 🟢 ISSUE-SYNC-04: Router Upload Berkas Gambar Multipart (`POST /uploads/images`)

**Status:** ✅ **Sudah Tersedia di Backend & Terintegrasi di Frontend**
- `POST /uploads/images` (Multipart form-data: `file`, `folder: "images" | "qris"`).
- Frontend menggunakan folder `images` untuk Cover, Galeri, & Kisah Cinta, serta folder `qris` untuk QRIS Hadiah.
- Response JSON Backend:
```jsonc
{
  "success": true,
  "data": {
    "url": "/uploads/images/foto-1.webp",
    "filename": "foto-1.webp"
  }
}
```

## 📋 Detail Penyesuaian Sisi Frontend (Informasi untuk Tim Backend)

1. **Format Tanggal & Waktu:** Ditampilkan 2 baris (`DD-MM-YY` pada baris 1 dan `HH:mm:ss WIB` pada baris 2). Backend tetap mengirimkan ISO 8601 string pada `receivedAt`.
2. **Filter Nominal Uang:** Kolom "Nominal Uang" hanya menjumlahkan item dengan `category === 'Uang'`, mengabaikan beras/barang fisik.
3. **Penyederhanaan Rincian Bantuan:** Menggunakan ikon kategori saja tanpa label badge teks, kuantitas diletakkan di bawah nama item, dan simbol strip dihapus.
4. **Input Nominal Otomatis:** Input form modal memformat ribuan otomatis (`100.000`), dan nilai dikirim bersih sebagai integer number ke backend.
5. **Input Acara Undangan:** Pengguna dapat mengetikkan nama acara secara manual pada modal catatan buwuh.

## ✅ Checklist Prioritas Tim Backend

Silakan gunakan checklist berikut untuk pembaruan sprint backend:

- [ ] **DB Migration:** Tambahkan kolom `giver_address` (text, nullable) di tabel `buwuhan`
- [ ] **DB Migration:** Pastikan kolom `invitation_id` di tabel `buwuhan` bersifat `NULLABLE`
- [ ] **Schema Zod:** Tambahkan `giverAddress` (opsional) pada `createBuwuhanSchema` & `updateBuwuhanSchema`
- [ ] **Serializer Buwuhan:** Sertakan `giverAddress` pada response `GET /invitations/:id/buwuhans` dan `GET /buwuhans/:id`
- [ ] **Endpoint Standalone:** Buat handler `GET /buwuhans/standalone` & `POST /buwuhans/standalone`
- [ ] **Endpoint Export (Opsional):** Buat streaming export xlsx/csv untuk tamu, rsvp, dan buwuhan
- [x] **Endpoint Upload:** Router upload gambar multipart `POST /uploads/images` (Sudah Aktif)
- [ ] **Update Status:** Perbarui status di `PLANNING.md` menjadi `✅ Synchronized` jika backend sudah deploy

## 📎 Referensi File Terkait di Frontend

| Berkas Frontend | Keterangan Modifikasi |
| :--- | :--- |
| `src/types/invitation-api.ts` | Definisi tipe `giverAddress`, `invitationId`, `invitationTitle` pada payload buwuhan |
| `src/hooks/useStandaloneBuwuhan.ts` | Hook catatan buwuh mandiri dengan fallback offline localStorage |
| `src/lib/format.ts` | Utilitas format tanggal `formatDateCompact()` dan waktu `formatTimeCompact()` |
| `src/lib/buwuhHelper.ts` | Utilitas hitung statistik buwuh dan filter nominal uang `sumMoneyOnly()` |
| `src/lib/export.ts` | Integrasi endpoint server export dengan client-side CSV fallback |
| `src/pages/dashboard/BuwuhPage.tsx` | Halaman Catatan Buwuh Dashboard dengan CRUD, filter, dan tabel sinkron |
| `src/pages/panel/PanelCatatanBuwuhPage.tsx` | Halaman Catatan Buwuh Panel Undangan dengan 7 kolom terstruktur |
| `src/components/panel/BuwuhanFormModal.tsx` | Modal form buwuh (Nama, Catatan, Acara Undangan manual, Alamat, Rincian) |
| `src/components/panel/BuwuhanDetailModal.tsx` | Modal detail buwuh dengan alamat, nominal uang, dan format tanggal |

*Dokumen ini dibuat otomatis sebagai panduan sinkronisasi antara repositori Frontend dan Backend Buwuhan.*
