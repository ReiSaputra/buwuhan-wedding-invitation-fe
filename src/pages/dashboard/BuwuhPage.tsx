import { useState, useMemo } from 'react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Download,
  Search,
  Gift,
  Package,
  CalendarCheck,
} from 'lucide-react'

export type BuwuhAidRecord = {
  id: string
  donorName: string
  invitationTitle: string
  aidType: string
  quantity: string
  createdAt: string
  message: string
}

const MOCK_AID_RECORDS: BuwuhAidRecord[] = [
  {
    id: 'aid-1',
    donorName: 'H. Ahmad & Keluarga',
    invitationTitle: 'Han & Saputra',
    aidType: 'Beras',
    quantity: '50 Kg',
    createdAt: '21 Agustus 2026, 20:15',
    message: 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah.',
  },
  {
    id: 'aid-2',
    donorName: 'Dr. Diana Kusuma',
    invitationTitle: 'Han & Saputra',
    aidType: 'Sayuran',
    quantity: '3 Keranjang',
    createdAt: '21 Agustus 2026, 18:30',
    message: 'Semoga selalu dilimpahi kebahagiaan berdua!',
  },
  {
    id: 'aid-3',
    donorName: 'Rudi Hartono',
    invitationTitle: 'Janpiter & Yudi',
    aidType: 'Buah',
    quantity: '5 Dus',
    createdAt: '21 Agustus 2026, 14:10',
    message: 'Langgeng sampai kakek nenek bro.',
  },
  {
    id: 'aid-4',
    donorName: 'Siti Aminah',
    invitationTitle: 'Han & Saputra',
    aidType: 'Sembako',
    quantity: '4 Paket',
    createdAt: '20 Agustus 2026, 11:00',
    message: 'Mohon maaf belum bisa hadir langsung, doa terbaik untuk kalian.',
  },
  {
    id: 'aid-5',
    donorName: 'Bpk. Bambang Sutrisno',
    invitationTitle: 'Han & Saputra',
    aidType: 'Beras',
    quantity: '100 Kg',
    createdAt: '20 Agustus 2026, 09:30',
    message: 'Semoga lancar dan berkah seluruh rangkaian acaranya.',
  },
  {
    id: 'aid-6',
    donorName: 'Ibu Hj. Maryam',
    invitationTitle: 'Han & Saputra',
    aidType: 'Sayuran',
    quantity: '2 Karung',
    createdAt: '19 Agustus 2026, 16:45',
    message: 'Selamat berbahagia untuk kedua mempelai.',
  },
]

/**
 * Halaman Manajemen Catatan Buwuh.
 * Menyediakan ikhtisar total bantuan (beras, sayuran, buah, sembako) yang masuk dari tamu,
 * rincian rekapitulasi bantuan, serta riwayat catatan dengan fitur pencarian & ekspor.
 */
export default function BuwuhPage() {
  const [search, setSearch] = useState('')

  const filteredRecords = useMemo(() => {
    return MOCK_AID_RECORDS.filter((rec) => {
      const query = search.toLowerCase()
      return (
        rec.donorName.toLowerCase().includes(query) ||
        rec.invitationTitle.toLowerCase().includes(query) ||
        rec.aidType.toLowerCase().includes(query) ||
        rec.quantity.toLowerCase().includes(query) ||
        rec.message.toLowerCase().includes(query)
      )
    })
  }, [search])

  /**
   * Mengekspor laporan catatan buwuh ke file CSV/Excel.
   */
  function handleExport() {
    alert('Laporan riwayat catatan buwuh berhasil diekspor (Format .CSV / .XLSX).')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Catatan Buwuh' }]} />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>Catatan Buwuh</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Pantau dan kelola seluruh catatan pemberian bantuan (beras, sayuran, buah, dll) dari para tamu undangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExport}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Kartu Ringkasan Metrik Bantuan Buwuh */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Bantuan Terkumpul"
          value="148 Bantuan"
          icon={<Gift size={18} />}
          hint="Dari seluruh daftar tamu buwuhan"
          colorAccent="emerald"
        />
        <StatCard
          label="Beras"
          value="350 Kg"
          icon={<Package size={18} />}
          hint="Sumbangan bahan pokok beras"
          colorAccent="amber"
        />
        <StatCard
          label="Total Bantuan Masuk Bulan Ini"
          value="24 Bantuan"
          icon={<CalendarCheck size={18} />}
          hint="Tercatat di bulan Agustus 2026"
          colorAccent="violet"
        />
      </div>

      {/* Tabel Riwayat Catatan Bantuan Buwuh */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        {/* Toolbar Pencarian */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pemberi, jenis bantuan, atau ucapan..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Pemberi / Tamu</th>
                <th className="px-5 py-3.5">Acara Undangan</th>
                <th className="px-5 py-3.5">Jenis Bantuan</th>
                <th className="px-5 py-3.5">Jumlah / Rincian</th>
                <th className="px-5 py-3.5">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    Tidak ada catatan buwuh yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{rec.donorName}</p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                        "{rec.message}"
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {rec.invitationTitle}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          rec.aidType === 'Beras'
                            ? 'warning'
                            : rec.aidType === 'Sayuran'
                            ? 'success'
                            : rec.aidType === 'Buah'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        {rec.aidType}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-bold text-ink font-display text-sm">
                      {rec.quantity}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{rec.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}