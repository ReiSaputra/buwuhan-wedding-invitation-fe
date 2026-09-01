import { useState, useMemo } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import {
  Package,
  Wheat,
  Calendar,
  Search,
} from 'lucide-react'

type BuwuhBantuanItem = {
  id: string
  donorName: string
  invitationTitle: string
  category: 'Beras' | 'Sayuran' | 'Buah' | 'Sembako' | string
  amountDetail: string
  createdAt: string
  message: string
}

const MOCK_BANTUAN: BuwuhBantuanItem[] = [
  {
    id: 'b1',
    donorName: 'H. Ahmad & Keluarga',
    invitationTitle: 'Han & Saputra',
    category: 'Beras',
    amountDetail: '50 Kg',
    createdAt: '21 Agustus 2026, 20:15',
    message: 'Selamat menempuh hidup baru, semoga sakinah mawaddah...',
  },
  {
    id: 'b2',
    donorName: 'Dr. Diana Kusuma',
    invitationTitle: 'Han & Saputra',
    category: 'Sayuran',
    amountDetail: '3 Keranjang',
    createdAt: '21 Agustus 2026, 18:30',
    message: 'Semoga selalu dilimpahi kebahagiaan berdua!',
  },
  {
    id: 'b3',
    donorName: 'Rudi Hartono',
    invitationTitle: 'Janpiter & Yudi',
    category: 'Buah',
    amountDetail: '5 Dus',
    createdAt: '21 Agustus 2026, 14:10',
    message: 'Langgeng sampai kakek nenek bro.',
  },
  {
    id: 'b4',
    donorName: 'Siti Aminah',
    invitationTitle: 'Han & Saputra',
    category: 'Sembako',
    amountDetail: '4 Paket',
    createdAt: '20 Agustus 2026, 11:00',
    message: 'Mohon maaf belum bisa hadir langsung, doa terbaik untuk kalian.',
  },
  {
    id: 'b5',
    donorName: 'Bpk. Bambang Sutrisno',
    invitationTitle: 'Han & Saputra',
    category: 'Beras',
    amountDetail: '100 Kg',
    createdAt: '20 Agustus 2026, 09:30',
    message: 'Semoga lancar dan berkah seluruh rangkaian acaranya.',
  },
  {
    id: 'b6',
    donorName: 'Ibu Hj. Maryam',
    invitationTitle: 'Han & Saputra',
    category: 'Sayuran',
    amountDetail: '2 Karung',
    createdAt: '19 Agustus 2026, 16:45',
    message: 'Selamat berbahagia untuk kedua mempelai.',
  },
]

/**
 * Halaman Manajemen Catatan Buwuh (Bantuan Fisik & Sumbangan Tradisi).
 * Menyediakan ikhtisar total bantuan buwuh masuk (Beras, Sayuran, Sembako, dll),
 * serta riwayat pencatatan tamu dengan fitur pencarian.
 */
export default function BuwuhPage() {
  const [search, setSearch] = useState('')

  const filteredBantuan = useMemo(() => {
    return MOCK_BANTUAN.filter((item) => {
      const q = search.toLowerCase()
      return (
        item.donorName.toLowerCase().includes(q) ||
        item.invitationTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.amountDetail.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      )
    })
  }, [search])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Kartu Ringkasan Metrik Bantuan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Bantuan Terkumpul"
          value="148 Bantuan"
          icon={<Package size={18} />}
          hint="Dari seluruh daftar tamu buwuhan"
          colorAccent="emerald"
        />
        <StatCard
          label="Beras"
          value="350 Kg"
          icon={<Wheat size={18} />}
          hint="Sumbangan bahan pokok beras"
          colorAccent="amber"
        />
        <StatCard
          label="Total Bantuan Masuk Bulan Ini"
          value="24 Bantuan"
          icon={<Calendar size={18} />}
          hint="Tercatat di bulan Agustus 2026"
          colorAccent="violet"
        />
      </div>

      {/* Tabel Riwayat Bantuan */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        {/* Toolbar Pencarian */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
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
              {filteredBantuan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    Tidak ada catatan bantuan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredBantuan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{item.donorName}</p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                        "{item.message}"
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {item.invitationTitle}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          item.category === 'Beras'
                            ? 'warning'
                            : item.category === 'Sayuran'
                            ? 'success'
                            : item.category === 'Buah'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-bold text-ink text-xs">
                      {item.amountDetail}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{item.createdAt}</td>
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