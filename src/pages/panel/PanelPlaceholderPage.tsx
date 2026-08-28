import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import {
  CheckCircle2,
  Sparkles,
  Plus,
  Search,
  Download,
  Camera,
  ExternalLink,
} from 'lucide-react'

export type PanelPlaceholderPageProps = {
  /** Judul modul panel */
  title: string
}

/**
 * Komponen Halaman Fitur Sub-Panel Undangan.
 * Menampilkan antarmuka interaktif yang disesuaikan secara dinamis
 * untuk Scan QR, Buku Tamu, Kehadiran, Hadiah, Petugas, Template, dan Catatan Buwuh.
 * 
 * @param props - Properti modul (title)
 */

export default function PanelPlaceholderPage({ title }: PanelPlaceholderPageProps) {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)

  // State untuk Simulator Scan QR
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<string | null>(null)

  /**
   * Menjalankan simulasi check-in tamu via barcode/QR.
   */
  function handleSimulateScan(guestName: string) {
    setScanResult(`Check-in Berhasil: ${guestName} (2 Pax) - Meja VIP 04`)
    setTimeout(() => setScanResult(null), 4000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: title },
        ]}
      />

      {/* Header Modul */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Kelola modul {title} untuk acara pernikahan {invitation.coupleName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/undangan/${invitation.slug}`} target="_blank">
            <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
              Buka Web
            </Button>
          </Link>
        </div>
      </div>

      {/* Konten Spesifik Berdasarkan Judul Modul */}
      {title === 'Scan QR' && (
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Kamera Viewfinder Simulator */}
          <div className="rounded-3xl border border-border bg-slate-900 p-6 text-white text-center shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Kamera Scanner Aktif
              </span>
              <span>Kamera Belakang (HD)</span>
            </div>

            {/* Viewfinder Window */}
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400/60 bg-slate-800/60 overflow-hidden">
              <Camera size={48} className="text-slate-600 animate-pulse" />
              {/* Animasi Garis Laser Scanner */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 animate-bounce shadow-lg shadow-indigo-500/50" />
            </div>

            <p className="text-xs text-slate-300">
              Arahkan kamera ke QR Code pada kartu undangan digital tamu.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleSimulateScan('Bpk. Hendra Gunawan')}
              >
                Simulasikan Deteksi QR Tamu
              </Button>
            </div>
          </div>

          {/* Form Input Manual & Notifikasi Sukses */}
          <div className="space-y-4">
            {scanResult && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-3 animate-in zoom-in-95">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">Verifikasi Berhasil!</strong>
                  <span className="text-xs">{scanResult}</span>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-base font-bold text-ink">Input Kode Tiket Manual</h3>
              <p className="text-xs text-muted">
                Jika kamera bermasalah atau tamu tidak membawa QR, masukkan 6 digit kode undangan:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: BW-7821"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-ink uppercase tracking-wider focus:border-primary focus:outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (manualCode) handleSimulateScan(`Tamu Kode ${manualCode.toUpperCase()}`)
                  }}
                >
                  Check-in
                </Button>
              </div>
            </div>

            {/* Rekap Cepat */}
            <div className="rounded-3xl border border-border bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statistik Meja Tamu</h3>
              <div className="flex items-center justify-between text-xs">
                <span>Total Tamu Hadir Saat Ini</span>
                <strong className="text-primary font-bold text-sm">731 Orang</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Total Souvenir Diserahkan</span>
                <strong className="text-ink font-bold text-sm">480 Pcs</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {title === 'Buku Tamu' && (
        <div className="rounded-3xl border border-border bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama tamu / alamat / sesi..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<Download size={14} />}>
                Export Excel
              </Button>
              <Button variant="primary" size="sm" icon={<Plus size={14} />}>
                Tambah Tamu
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Nama Tamu</th>
                  <th className="px-4 py-3">Sesi Acara</th>
                  <th className="px-4 py-3">Jumlah Pax</th>
                  <th className="px-4 py-3">Status Undangan</th>
                  <th className="px-4 py-3">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Keluarga Bpk. H. Ahmad', session: 'Sesi 1 (Akad & Siang)', pax: 4, status: 'Terkirim (WA)', checked: 'Sudah Check-in' },
                  { name: 'Dr. Diana Kusuma & Partner', session: 'Sesi 2 (Malam)', pax: 2, status: 'Terkirim (WA)', checked: 'Sudah Check-in' },
                  { name: 'Rekan Kerja Dept. IT', session: 'Sesi 2 (Malam)', pax: 8, status: 'Terkirim (Email)', checked: 'Belum Hadir' },
                ].map((guest, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-bold text-ink">{guest.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">{guest.session}</td>
                    <td className="px-4 py-3.5 text-slate-600">{guest.pax} Orang</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="primary">{guest.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 font-semibold ${guest.checked.includes('Sudah') ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 size={12} /> {guest.checked}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {title === 'Template' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Royal Javanese Elegance', tag: 'Terpilih', isCurrent: true, color: '#6366f1' },
            { name: 'Modern Minimalist Botanical', tag: 'Pro Plan', isCurrent: false, color: '#10b981' },
            { name: 'Luxury Burgundy Velvet', tag: 'Max Plan', isCurrent: false, color: '#be123c' },
          ].map((theme, i) => (
            <div key={i} className={`rounded-3xl border p-5 bg-white shadow-xs space-y-4 ${theme.isCurrent ? 'border-2 border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <div className="h-40 rounded-2xl bg-gradient-to-tr from-slate-100 to-indigo-50 border border-slate-200 flex items-center justify-center text-slate-400 font-display text-lg font-bold">
                Preview {theme.name}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">{theme.name}</h4>
                  <span className="text-xs text-muted">Responsif & Animasi Halus</span>
                </div>
                <Badge variant={theme.isCurrent ? 'primary' : 'default'}>{theme.tag}</Badge>
              </div>
              <Button variant={theme.isCurrent ? 'primary' : 'outline'} size="sm" className="w-full">
                {theme.isCurrent ? 'Template Aktif' : 'Terapkan Template'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {title !== 'Scan QR' && title !== 'Buku Tamu' && title !== 'Template' && (
        <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Fitur {title} Siap Dikonfigurasi</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Modul ini telah terintegrasi dengan basis data undangan {invitation.coupleName}. Anda dapat mengubah data secara real-time kapan saja.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => alert(`Fitur ${title} tersimpan.`)}>
            Simpan Perubahan {title}
          </Button>
        </div>
      )}
    </div>
  )
}