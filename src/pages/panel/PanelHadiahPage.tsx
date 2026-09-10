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
  Edit2,
  Landmark,
  QrCode,
  Loader2,
} from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { RowActions } from '@/components/ui/RowActions'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ImageUploadInput } from '@/components/ui/ImageUploadInput'
import { useGifts } from '@/hooks/useGifts'
import { useGiftAccounts } from '@/hooks/useGiftAccounts'
import { formatDateId, formatNumber, formatRupiah, formatTimeWib, getInitial } from '@/lib/format'
import type { GiftAccount, GiftAccountPayload, GiftKind, GiftRecord } from '@/types/panel'

/** Jumlah baris yang ditampilkan pertama kali dan setiap kali tombol muat ditekan. */
const PAGE_STEP = 8

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/**
 * Halaman Manajemen Hadiah & Catatan Amplop Digital pada Panel Undangan.
 * Menyediakan konfigurasi rekening digital pengantin serta pencatatan tanda kasih dari para tamu.
 */
export default function PanelHadiahPage() {
  const { id = '' } = useParams()
  const [activeTab, setActiveTab] = useState<'accounts' | 'history'>('accounts')

  // Hook data rekening dan hadiah
  const {
    accounts,
    isLoading: isAccountsLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    isCreating: isCreatingAccount,
    isUpdating: isUpdatingAccount,
  } = useGiftAccounts(id)

  const {
    gifts,
    stats,
    isLoading: isGiftsLoading,
    createGift,
    updateGift,
    removeGift,
    isCreating: isCreatingGift,
    isUpdating: isUpdatingGift,
  } = useGifts(id)

  // State Riwayat Hadiah
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingGift, setDeletingGift] = useState<GiftRecord | null>(null)
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<GiftRecord | null>(null)

  // State Form Catat Hadiah Manual
  const [guestName, setGuestName] = useState('')
  const [giftKind, setGiftKind] = useState<GiftKind>('UANG')
  const [amount, setAmount] = useState('')
  const [itemName, setItemName] = useState('')
  const [methodLabel, setMethodLabel] = useState('Transfer BCA')

  // State Form Rekening Digital
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<GiftAccount | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<GiftAccount | null>(null)
  const [accountBankName, setAccountBankName] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountType, setAccountType] = useState('Mempelai Pria')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const visibleGifts = gifts.slice(0, visibleCount)
  const hasMore = visibleCount < gifts.length
  const physicalGiftCount = stats.physicalCount ?? gifts.filter((g) => g.kind === 'BARANG').length

  // --- Handlers Rekening Digital ---

  function handleOpenAddAccount() {
    setEditingAccount(null)
    setAccountBankName('BCA')
    setAccountNumber('')
    setAccountHolder('')
    setAccountType('Mempelai Pria')
    setQrCodeUrl('')
    setIsAccountModalOpen(true)
  }

  function handleOpenEditAccount(acc: GiftAccount) {
    setEditingAccount(acc)
    setAccountBankName(acc.bankName)
    setAccountNumber(acc.accountNumber)
    setAccountHolder(acc.accountHolder)
    setAccountType(acc.type)
    const existingQris =
      acc.qrCodeUrl ||
      ((acc as Record<string, unknown>).qrCode as string) ||
      ((acc as Record<string, unknown>).qrisImageUrl as string) ||
      ((acc as Record<string, unknown>).qr_code_url as string) ||
      ((acc as Record<string, unknown>).imageUrl as string) ||
      ((acc as Record<string, unknown>).qrisUrl as string) ||
      ''
    setQrCodeUrl(existingQris)
    setIsAccountModalOpen(true)
  }

  async function handleSaveAccount(e: FormEvent) {
    e.preventDefault()
    if (!accountBankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return

    const qrisValue = qrCodeUrl.trim() || null
    const payload: GiftAccountPayload & Record<string, unknown> = {
      bankName: accountBankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      type: accountType.trim() || 'Mempelai',
      qrCodeUrl: qrisValue,
      qrCode: qrisValue,
      qrisImageUrl: qrisValue,
      qr_code_url: qrisValue,
    }

    try {
      if (editingAccount) {
        await updateAccount({ id: editingAccount.id, payload })
        showToast('Rekening & QRIS berhasil diperbarui!')
      } else {
        await createAccount(payload)
        showToast('Rekening baru berhasil ditambahkan!')
      }
      setIsAccountModalOpen(false)
    } catch {
      showToast('Terjadi kendala saat menyimpan rekening.')
    }
  }

  async function handleConfirmDeleteAccount() {
    if (!deletingAccount) return
    try {
      await deleteAccount(deletingAccount.id)
      showToast('Rekening berhasil dihapus.')
      setDeletingAccount(null)
    } catch {
      showToast('Gagal menghapus rekening.')
    }
  }

  // --- Handlers Catatan Hadiah ---

  async function handleCopyDetail(gift: GiftRecord) {
    const value = gift.kind === 'UANG' ? formatRupiah(gift.amount ?? 0) : (gift.itemName ?? '-')
    await navigator.clipboard.writeText(
      `${gift.guestName} - ${value} - ${gift.methodLabel} - ${formatDateId(gift.createdAt)}`,
    )
    setCopiedId(gift.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleConfirmDeleteGift() {
    if (!deletingGift) return
    try {
      await removeGift(deletingGift.id)
      showToast('Catatan hadiah berhasil dihapus.')
      setDeletingGift(null)
    } catch {
      showToast('Gagal menghapus catatan hadiah.')
    }
  }

    function handleOpenAddGift() {
    setEditingGift(null)
    setGuestName('')
    setGiftKind('UANG')
    setAmount('')
    setItemName('')
    setMethodLabel('Transfer BCA')
    setIsAddGiftModalOpen(true)
  }

  function handleOpenEditGift(gift: GiftRecord) {
    setEditingGift(gift)
    setGuestName(gift.guestName)
    setGiftKind(gift.kind)
    setAmount(gift.amount ? String(gift.amount) : '')
    setItemName(gift.itemName ?? '')
    setMethodLabel(gift.methodLabel)
    setIsAddGiftModalOpen(true)
  }

  async function handleSaveManualGift(e: FormEvent) {
    e.preventDefault()
    if (!guestName.trim()) return

    const payload = {
      guestName: guestName.trim(),
      kind: giftKind,
      amount: giftKind === 'UANG' ? Number(amount.replace(/\D/g, '')) || 0 : null,
      itemName: giftKind === 'BARANG' ? itemName.trim() || 'Bingkisan Kado' : null,
      methodLabel,
      isDigital: methodLabel.includes('Transfer') || methodLabel.includes('QRIS'),
    }

    try {
      if (editingGift) {
        await updateGift({ id: editingGift.id, payload })
        showToast('Catatan hadiah berhasil diperbarui!')
      } else {
        await createGift(payload)
        showToast('Catatan hadiah berhasil ditambahkan!')
      }
      setIsAddGiftModalOpen(false)
      setEditingGift(null)
      setGuestName('')
      setAmount('')
      setItemName('')
    } catch {
      showToast('Gagal menyimpan catatan hadiah.')
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-3">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Undangan', to: `/dashboard/undangan/${id}` },
          { label: 'Hadiah & Rekening' },
        ]}
        title="Hadiah & Rekening Digital"
        subtitle="Kelola rekening penerima amplop digital serta rekapitulasi tanda kasih dari para tamu"
        actions={
          activeTab === 'accounts' ? (
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={handleOpenAddAccount}
            >
              Tambah Rekening
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={handleOpenAddGift}
            >
              Catat Hadiah Manual
            </Button>
          )
        }
      />

      {/* Tab Navigasi Modul Hadiah */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark size={16} />
          <span>Rekening & Amplop Digital ({accounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift size={16} />
          <span>Riwayat Tanda Kasih Masuk ({gifts.length})</span>
        </button>
      </div>

      {/* TAB 1: REKENING & AMPLOP DIGITAL */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Info Card Pengantar */}
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-950">
            <CreditCard size={18} className="shrink-0 text-primary mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-ink">Informasi Rekening Amplop Digital</p>
              <p className="text-slate-600 leading-relaxed">
                Rekening bank atau dompet digital yang Anda daftarkan di sini akan tampil di section <strong>Wedding Gift & Buwuh</strong> pada halaman undangan digital tamu, lengkap dengan tombol salin nomor rekening instan.
              </p>
            </div>
          </div>

          {/* Grid Daftar Rekening */}
          {isAccountsLoading ? (
            <div className="flex items-center justify-center py-16 text-muted">
              <Loader2 size={24} className="animate-spin text-primary mr-2" />
              <span className="text-xs">Memuat daftar rekening...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary mb-3">
                <Landmark size={26} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">Belum Ada Rekening Digital</h3>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                Tambahkan nomor rekening BCA, Mandiri, BRI, atau e-wallet (GoPay, OVO, ShopeePay) untuk memudahkan tamu mengirimkan amplop digital.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                className="mt-4"
                onClick={handleOpenAddAccount}
              >
                Tambah Rekening Pertama
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md flex flex-col justify-between space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-display text-xs font-bold text-primary border border-indigo-100">
                        {acc.bankName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-ink">{acc.bankName}</h4>
                        <span className="text-[10px] font-bold text-primary bg-indigo-50 px-2 py-0.5 rounded-md">
                          {acc.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAccount(acc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition cursor-pointer"
                        title="Edit Rekening"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingAccount(acc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Nomor Rekening
                    </span>
                    <p className="font-display text-lg font-bold tracking-wider text-ink font-mono">
                      {acc.accountNumber}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">a.n. {acc.accountHolder}</p>
                  </div>

                  {(() => {
                    const cardQris =
                      acc.qrCodeUrl ||
                      ((acc as Record<string, unknown>).qrCode as string) ||
                      ((acc as Record<string, unknown>).qrisImageUrl as string) ||
                      ((acc as Record<string, unknown>).qr_code_url as string) ||
                      ((acc as Record<string, unknown>).imageUrl as string) ||
                      ((acc as Record<string, unknown>).qrisUrl as string) ||
                      null

                    return cardQris ? (
                      <div className="flex items-center gap-2 rounded-2xl bg-indigo-50/70 p-2.5 border border-indigo-100/80">
                        <img
                          src={cardQris}
                          alt="QRIS Preview"
                          className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white border border-slate-100 p-0.5 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                            <QrCode size={13} />
                            <span>QRIS Aktif</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">Tampil pada undangan digital</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditAccount(acc)}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-2.5 text-[11px] text-slate-500 hover:border-primary hover:bg-indigo-50/40 hover:text-primary transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <QrCode size={13} className="text-slate-400" />
                          <span>Belum ada QRIS</span>
                        </span>
                        <span className="text-[10px] font-bold text-primary">+ Tambah</span>
                      </button>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT TANDA KASIH MASUK */}
      {activeTab === 'history' && (
        <div className="space-y-6">
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
                {isGiftsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                      <Loader2 size={20} className="animate-spin text-primary inline mr-2" />
                      <span>Memuat catatan hadiah...</span>
                    </td>
                  </tr>
                ) : visibleGifts.length === 0 ? (
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
                ) : (
                  visibleGifts.map((gift) => (
                    <tr key={gift.id} className="transition hover:bg-slate-50/70">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-primary border border-indigo-100/80">
                            {getInitial(gift.guestName)}
                          </div>
                          <div>
                            <span className="font-bold text-ink block text-xs">{gift.guestName}</span>
                            <span className="text-[11px] text-slate-400">ID: {gift.id.slice(-6)}</span>
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
                              label: 'Edit Catatan',
                              icon: <Edit2 size={14} />,
                              onClick: () => handleOpenEditGift(gift),
                            },
                            {
                              label: 'Hapus Catatan',
                              icon: <Trash2 size={14} />,
                              onClick: () => setDeletingGift(gift),
                              isDanger: true,
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
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
        </div>
      )}

      {/* Modal Dialog Tambah/Edit Rekening Digital */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title={editingAccount ? 'Ubah Rekening Hadiah' : 'Tambah Rekening Hadiah'}
        description="Informasi rekening bank atau dompet digital untuk menerima amplop dari tamu"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Penyedia Bank / E-Wallet *
            </label>
            <input
              type="text"
              required
              value={accountBankName}
              onChange={(e) => setAccountBankName(e.target.value)}
              placeholder="Contoh: BCA, Bank Mandiri, GoPay, OVO"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nomor Rekening / No. HP E-Wallet *
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 1234567890"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Atas Nama Pemilik Rekening *
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Sesuai buku tabungan / aplikasi"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Keterangan Penerima
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs"
            >
              <option value="Mempelai Pria">Mempelai Pria</option>
              <option value="Mempelai Wanita">Mempelai Wanita</option>
              <option value="Keluarga Mempelai Pria">Keluarga Mempelai Pria</option>
              <option value="Keluarga Mempelai Wanita">Keluarga Mempelai Wanita</option>
            </select>
          </div>

          <ImageUploadInput
            label="Kode QRIS (Opsional)"
            value={qrCodeUrl}
            onChange={setQrCodeUrl}
            isQris={true}
            maxSizeMb={5}
            helperText="Unggah gambar QRIS (PNG, JPG, WebP, maks. 5 MB) agar tamu dapat scan amplop langsung dari undangan."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingAccount || isUpdatingAccount}
              icon={<Sparkles size={14} />}
            >
              {editingAccount ? 'Simpan Perubahan' : 'Tambah Rekening'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dialog Tambah Catatan Hadiah Manual */}
      <Modal
        isOpen={isAddGiftModalOpen}
        onClose={() => {
          setIsAddGiftModalOpen(false)
          setEditingGift(null)
        }}
        title={editingGift ? "Ubah Catatan Hadiah" : "Catat Hadiah Tamu Manual"}
        description={editingGift ? "Perbarui nominal atau rincian hadiah dari tamu" : "Tambahkan catatan amplop tunai atau kado fisik yang diserahkan di lokasi"}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddGiftModalOpen(false)
                setEditingGift(null)
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingGift || isUpdatingGift}
              icon={<Sparkles size={14} />}
            >
              {editingGift ? 'Simpan Perubahan' : 'Simpan Hadiah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Rekening */}
      <Modal
        isOpen={deletingAccount !== null}
        onClose={() => setDeletingAccount(null)}
        title="Hapus Rekening Hadiah?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus rekening <strong>{deletingAccount?.bankName} ({deletingAccount?.accountNumber})</strong>? Rekening ini tidak akan lagi tampil di halaman undangan digital.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingAccount(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteAccount}>
              Ya, Hapus
            </Button>
          </div>
        </div>
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
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteGift}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
