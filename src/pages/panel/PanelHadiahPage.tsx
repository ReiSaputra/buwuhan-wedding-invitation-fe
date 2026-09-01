import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  ChevronDown,
  Copy,
  CreditCard,
  Trash2,
  UsersRound,
  Gift,
  Plus,
  Check,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { RowActions } from '@/components/ui/RowActions'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useGifts } from '@/hooks/useGifts'
import { formatDateId, formatNumber, formatRupiah, formatTimeWib, getInitial } from '@/lib/format'
import type { GiftRecord } from '@/types/panel'
import { PreviewDataBanner } from '@/components/common/PreviewDataBanner'

/** Jumlah baris yang ditampilkan pertama kali dan setiap kali tombol muat ditekan. */
const PAGE_STEP = 6

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/**
 * Halaman Manajemen Hadiah & Catatan Amplop Digital pada Panel Undangan.
 * Mencatat pemberian dana donasi via transfer bank/QRIS maupun kado fisik dari para tamu,
 * dilengkapi modal penambahan manual dan ringkasan metrik statistik.
 */
export default function PanelHadiahPage() {
  const { id = '' } = useParams()
  const { gifts, stats, removeGift } = useGifts(id)

  const [visibleCount, setVisibleCount] = useState(PAGE_STEP)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingGift, setDeletingGift] = useState<GiftRecord | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form state untuk tambah hadiah manual
  const [guestName, setGuestName] = useState('')
  const [giftKind, setGiftKind] = useState<'UANG' | 'BARANG'>('UANG')
  const [amount, setAmount] = useState('')
  const [itemName, setItemName] = useState('')
  const [methodLabel, setMethodLabel] = useState('Transfer BCA')

  const visibleGifts = gifts.slice(0, visibleCount)
  const hasMore = visibleCount < gifts.length

  const physicalGiftCount = gifts.filter((g) => g.kind === 'BARANG').length

  /**
   * Menyalin rincian satu pemberian ke papan klip dengan teks terformat.
   * 
   * @param gift - Objek catatan hadiah
   */
  async function handleCopyDetail(gift: GiftRecord) {
    const value = gift.kind === 'UANG' ? formatRupiah(gift.amount ?? 0) : (gift.itemName ?? '-')
    await navigator.clipboard.writeText(
      `${gift.guestName} - ${value} - ${gift.methodLabel} - ${formatDateId(gift.createdAt)}`,
    )
    setCopiedId(gift.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  /**
   * Menampilkan modal konfirmasi hapus catatan pemberian.
   * 
   * @param gift - Objek hadiah yang ingin dihapus
   */
  function handlePromptDelete(gift: GiftRecord) {
    setDeletingGift(gift)
  }

  /**
   * Mengeksekusi penghapusan catatan setelah dikonfirmasi pengguna.
   */
  function handleConfirmDelete() {
    if (deletingGift) {
      removeGift(deletingGift.id)
      setDeletingGift(null)
    }
  }

  /**
   * Menangani penyimpanan catatan hadiah manual dari formulir modal.
   * 
   * @param e - Event formulir
   */
  function handleSaveManualGift(e: FormEvent) {
    e.preventDefault()
    if (!guestName.trim()) return

    const newRecord: GiftRecord = {
      id: `g-${Date.now()}`,
      guestName: guestName.trim(),
      kind: giftKind,
      amount: giftKind === 'UANG' ? Number(amount.replace(/\D/g, '')) || 500000 : null,
      itemName: giftKind === 'BARANG' ? itemName.trim() || 'Bingkisan Kado' : null,
      methodLabel,
      isDigital: methodLabel.includes('Transfer') || methodLabel.includes('QRIS'),
      createdAt: new Date().toISOString(),
    }

    gifts.unshift(newRecord)
    setIsAddModalOpen(false)
    setGuestName('')
    setAmount('')
    setItemName('')
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Halaman */}
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Undangan', to: `/dashboard/undangan/${id}` },
          { label: 'Hadiah & Amplop' },
        ]}
        title="Catatan Hadiah & Amplop Digital"
        subtitle="Rekapitulasi tanda kasih dan kiriman kado dari para tamu undangan"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Catat Hadiah Manual
          </Button>
        }
      />
      <PreviewDataBanner featureName="Catatan Hadiah" detail="Backend belum memiliki endpoint hadiah/pembayaran. Data berikut masih contoh." />
      

      {/* Kartu Ringkasan Metrik Statistik */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Donasi (Uang)"
          value={formatRupiah(stats.totalAmount)}
          icon={<CreditCard size={18} />}
          variant="gradient"
          hint="Total dana masuk via transfer & amplop"
        />
        <StatCard
          label="Partisipasi Tamu"
          value={`${formatNumber(stats.participantCount)} Orang`}
          icon={<UsersRound size={18} />}
          colorAccent="emerald"
          hint="Tamu yang memberikan tanda kasih"
        />
        <StatCard
          label="Total Kado Barang"
          value={`${formatNumber(physicalGiftCount)} Unit`}
          icon={<PackageCheck size={18} />}
          colorAccent="amber"
          hint="Bingkisan fisik diserahkan"
        />
      </div>

      {/* Tabel Riwayat Pemberian */}
      <TableCard
        title="Riwayat Tanda Kasih Masuk"
        footerLeft={`Menampilkan ${visibleGifts.length} dari ${formatNumber(gifts.length)} catatan hadiah`}
      >
        <table className="w-full min-w-3xl text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <th className={thClass}>Nama Pengirim</th>
              <th className={thClass}>Jenis Hadiah</th>
              <th className={thClass}>Nominal / Nama Item</th>
              <th className={thClass}>Metode Penyerahan</th>
              <th className={thClass}>Waktu Diterima</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {visibleGifts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted">
                  <div className="mx-auto max-w-xs space-y-2">
                    <Gift size={28} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">Belum ada catatan hadiah</p>
                    <p className="text-[11px] text-slate-400">
                      Catatan tanda kasih atau amplop digital tamu akan muncul di sini.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {visibleGifts.map((gift) => (
              <tr key={gift.id} className="transition hover:bg-slate-50/70">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-primary border border-indigo-100/80">
                      {getInitial(gift.guestName)}
                    </div>
                    <div>
                      <span className="font-bold text-ink block text-xs">{gift.guestName}</span>
                      <span className="text-[11px] text-slate-400">ID: {gift.id}</span>
                    </div>
                  </div>
                </td>

                <td className={tdClass}>
                  <Badge variant={gift.kind === 'UANG' ? 'primary' : 'warning'}>
                    {gift.kind === 'UANG' ? 'Amplop Uang' : 'Kado Barang'}
                  </Badge>
                </td>

                <td className={`${tdClass} font-bold text-ink`}>
                  {gift.kind === 'UANG' ? (
                    <span className="text-emerald-700 font-bold font-mono">
                      {formatRupiah(gift.amount ?? 0)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <Gift size={13} className="text-amber-500" />
                      {gift.itemName}
                    </span>
                  )}
                </td>

                <td className={`${tdClass} text-slate-600`}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{gift.methodLabel}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      {gift.isDigital ? 'Digital' : 'Fisik'}
                    </span>
                  </div>
                </td>

                <td className={`${tdClass} text-slate-600`}>
                  <div className="font-medium text-slate-700">{formatDateId(gift.createdAt)}</div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                    {formatTimeWib(gift.createdAt)}
                  </div>
                </td>

                <td className={tdClass}>
                  <RowActions
                    actions={[
                      {
                        label: copiedId === gift.id ? 'Tersalin!' : 'Salin Rincian',
                        icon: copiedId === gift.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />,
                        onClick: () => {
                          void handleCopyDetail(gift)
                        },
                      },
                      {
                        label: 'Hapus Catatan',
                        icon: <Trash2 size={14} />,
                        onClick: () => handlePromptDelete(gift),
                        isDanger: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* Tombol Muat Lebih Banyak */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-600 transition hover:border-primary hover:bg-indigo-50/50 hover:text-primary cursor-pointer shadow-xs"
        >
          <span>Muat Lebih Banyak Riwayat</span>
          <ChevronDown size={15} />
        </button>
      )}

      {/* Modal Dialog Tambah Catatan Hadiah Manual */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Hadiah Tamu Manual"
        description="Tambahkan catatan amplop tunai atau kado fisik yang diserahkan di lokasi"
        maxWidth="md"
      >
        <form onSubmit={handleSaveManualGift} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nama Tamu Pengirim *
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Contoh: Keluarga Bpk. Joko Widodo"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Jenis Hadiah
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGiftKind('UANG')}
                className={`rounded-xl p-2.5 text-xs font-semibold border transition cursor-pointer ${
                  giftKind === 'UANG'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                Uang / Amplop Digital
              </button>
              <button
                type="button"
                onClick={() => setGiftKind('BARANG')}
                className={`rounded-xl p-2.5 text-xs font-semibold border transition cursor-pointer ${
                  giftKind === 'BARANG'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                Kado Barang / Fisik
              </button>
            </div>
          </div>

          {giftKind === 'UANG' ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nominal Uang (Rp) *
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 1.000.000"
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nama Barang / Bingkisan *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Mesin Kopi Otomatis"
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Metode Penyerahan
            </label>
            <select
              value={methodLabel}
              onChange={(e) => setMethodLabel(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            >
              <option value="Transfer BCA">Transfer BCA</option>
              <option value="Transfer Mandiri">Transfer Mandiri</option>
              <option value="QRIS">QRIS</option>
              <option value="Amplop Tunai di Lokasi">Amplop Tunai di Lokasi</option>
              <option value="Diserahkan Langsung">Diserahkan Langsung</option>
              <option value="Kiriman Kurir">Kiriman Kurir</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" icon={<Sparkles size={14} />}>
              Simpan Hadiah
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Catatan Hadiah */}
      <Modal
        isOpen={deletingGift !== null}
        onClose={() => setDeletingGift(null)}
        title="Hapus Catatan Hadiah?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus catatan pemberian dari <strong>"{deletingGift?.guestName}"</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingGift(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

