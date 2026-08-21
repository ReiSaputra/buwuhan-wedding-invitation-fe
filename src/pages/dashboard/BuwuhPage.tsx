import { useState, useMemo } from 'react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatRupiah } from '@/lib/format'
import {
  Wallet,
  ArrowDownToLine,
  Download,
  QrCode,
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
} from 'lucide-react'

type BuwuhTransaction = {
  id: string
  donorName: string
  invitationTitle: string
  amount: number
  method: 'QRIS' | 'TRANSFER' | 'AMPLOP_FISIK'
  createdAt: string
  message: string
}

const MOCK_TRANSACTIONS: BuwuhTransaction[] = [
  {
    id: 'tx1',
    donorName: 'H. Ahmad & Keluarga',
    invitationTitle: 'Han & Saputra',
    amount: 1500000,
    method: 'TRANSFER',
    createdAt: '21 Agustus 2026, 20:15',
    message: 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah.',
  },
  {
    id: 'tx2',
    donorName: 'Dr. Diana Kusuma',
    invitationTitle: 'Han & Saputra',
    amount: 500000,
    method: 'QRIS',
    createdAt: '21 Agustus 2026, 18:30',
    message: 'Semoga selalu dilimpahi kebahagiaan berdua!',
  },
  {
    id: 'tx3',
    donorName: 'Rudi Hartono',
    invitationTitle: 'Janpiter & Yudi',
    amount: 300000,
    method: 'QRIS',
    createdAt: '21 Agustus 2026, 14:10',
    message: 'Langgeng sampai kakek nenek bro.',
  },
  {
    id: 'tx4',
    donorName: 'Siti Aminah',
    invitationTitle: 'Han & Saputra',
    amount: 250000,
    method: 'AMPLOP_FISIK',
    createdAt: '20 Agustus 2026, 11:00',
    message: 'Mohon maaf belum bisa hadir langsung, doa terbaik untuk kalian.',
  },
]

/**
 * Halaman Manajemen Buwuh & Amplop Digital.
 * Menyediakan ikhtisar total sumbangan/hadiah uang yang masuk dari tamu,
 * rincian kanal pembayaran (Transfer, QRIS, Tunai), dan riwayat transaksi dengan fitur pencarian & ekspor.
 */
export default function BuwuhPage() {
  const [search, setSearch] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')

  const totalBuwuh = useMemo(
    () => MOCK_TRANSACTIONS.reduce((sum, tx) => sum + tx.amount, 0),
    [],
  )

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchSearch =
        tx.donorName.toLowerCase().includes(search.toLowerCase()) ||
        tx.invitationTitle.toLowerCase().includes(search.toLowerCase()) ||
        tx.message.toLowerCase().includes(search.toLowerCase())

      const matchMethod = selectedMethod === 'ALL' || tx.method === selectedMethod

      return matchSearch && matchMethod
    })
  }, [search, selectedMethod])

  /**
   * Mengekspor laporan buwuh ke file CSV/Excel.
   */
  function handleExport() {
    alert('Laporan riwayat buwuh berhasil diekspor (Format .CSV / .XLSX).')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Buwuh' }]} />

      {/* Header Halaman */}
      <div className="rounded-2xl bg-white p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <span>Catatan Buwuh & Amplop Digital</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Pantau dan kelola seluruh pemberian tanda kasih serta amplop digital dari para tamu undangan.
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
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowDownToLine size={14} />}
            onClick={() => alert('Fitur pencairan dana akan mentransfer saldo ke rekening utama Anda dalam 1x24 jam.')}
          >
            Tarik Dana
          </Button>
        </div>
      </div>

      {/* Kartu Ringkasan Metrik Buwuh */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Dana Terkumpul"
          value={formatRupiah(totalBuwuh)}
          icon={<Wallet size={18} />}
          hint="Siap dicairkan ke rekening"
          colorAccent="emerald"
        />
        <StatCard
          label="Via Transfer Bank"
          value={formatRupiah(1500000)}
          icon={<CreditCard size={18} />}
          hint="1 transaksi terverifikasi"
          colorAccent="indigo"
        />
        <StatCard
          label="Via QRIS Instan"
          value={formatRupiah(800000)}
          icon={<QrCode size={18} />}
          hint="2 transaksi real-time"
          colorAccent="violet"
        />
        <StatCard
          label="Amplop Fisik (Tercatat)"
          value={formatRupiah(250000)}
          icon={<Banknote size={18} />}
          hint="1 amplop di kotak acara"
          colorAccent="amber"
        />
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pemberi atau ucapan..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'TRANSFER', 'QRIS', 'AMPLOP_FISIK'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setSelectedMethod(method)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedMethod === method
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {method === 'ALL'
                  ? 'Semua Metode'
                  : method === 'TRANSFER'
                  ? 'Transfer Bank'
                  : method === 'QRIS'
                  ? 'QRIS'
                  : 'Amplop Fisik'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Pemberi / Tamu</th>
                <th className="px-5 py-3.5">Acara Undangan</th>
                <th className="px-5 py-3.5">Metode</th>
                <th className="px-5 py-3.5">Nominal</th>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    Tidak ada catatan buwuh yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{tx.donorName}</p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                        "{tx.message}"
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {tx.invitationTitle}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          tx.method === 'QRIS'
                            ? 'primary'
                            : tx.method === 'TRANSFER'
                            ? 'default'
                            : 'warning'
                        }
                      >
                        {tx.method === 'TRANSFER'
                          ? 'Transfer Bank'
                          : tx.method === 'QRIS'
                          ? 'QRIS Instan'
                          : 'Amplop Fisik'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-600 font-display text-sm">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{tx.createdAt}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={12} />
                        Diterima
                      </span>
                    </td>
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