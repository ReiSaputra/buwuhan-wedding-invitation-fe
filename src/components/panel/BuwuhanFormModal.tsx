import { useState } from 'react'
import { Plus, Trash2, Banknote, Wheat, Gift } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  BUWUHAN_CATEGORIES,
  type ApiBuwuhan,
  type BuwuhanCategory,
  type BuwuhanItemPayload,
  type BuwuhanPayload,
  type BuwuhanUnit,
} from '@/types/invitation-api'
import { CATEGORY_UNITS, getBuwuhanCategory } from '@/lib/buwuhHelper'

export type BuwuhanFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: BuwuhanPayload) => void | Promise<void>
  /** Data awal saat mode ubah; null berarti mode tambah baru */
  initialValue?: ApiBuwuhan | null
  isSubmitting?: boolean
  /** ID undangan default jika dibuka dari panel undangan tertentu */
  defaultInvitationId?: string
  /** Nama acara default */
  defaultInvitationTitle?: string
  /** Apakah kolom input Acara Undangan ditampilkan (default: false di panel) */
  showInvitationField?: boolean
}

type DraftItem = {
  category: BuwuhanCategory
  itemName: string
  quantity: string
  unit: BuwuhanUnit
  estimatedValue: string
}

const EMPTY_ITEM: DraftItem = {
  category: 'Uang',
  itemName: 'Uang Tunai / Amplop',
  quantity: '1',
  unit: 'transaksi',
  estimatedValue: '',
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:border-primary focus:outline-none bg-white'

/** Format angka mentah ke pemisah ribuan Indonesia: 100000 → "100.000" */
function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

/** Hapus titik pemisah ribuan: "100.000" → "100000" */
function stripThousands(formatted: string): string {
  return formatted.replace(/\./g, '')
}

/**
 * Modal formulir pencatatan buwuh: satu pemberi dengan satu atau lebih
 * item bantuan khusus untuk 3 jenis bantuan utama: Uang, Beras, dan Barang.
 */
export function BuwuhanFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = null,
  isSubmitting = false,
  defaultInvitationId,
  defaultInvitationTitle,
  showInvitationField = false,
}: BuwuhanFormModalProps) {
  const [giverName, setGiverName] = useState(initialValue?.giverName ?? '')
  const [giverAddress, setGiverAddress] = useState(initialValue?.giverAddress ?? '')
  const [note, setNote] = useState(initialValue?.note ?? '')
  const [invitationTitle, setInvitationTitle] = useState(
    initialValue?.invitationTitle ?? defaultInvitationTitle ?? ''
  )
  const [items, setItems] = useState<DraftItem[]>(
    initialValue
      ? initialValue.items.map((item) => {
          const category = getBuwuhanCategory(item)
          return {
            category,
            itemName: item.itemName,
            quantity: String(item.quantity),
            unit: item.unit,
            estimatedValue: item.estimatedValue === null ? '' : String(item.estimatedValue),
          }
        })
      : [{ ...EMPTY_ITEM }],
  )

  /** Memperbarui satu kolom pada baris item tertentu. */
  function patchItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item

        const updated = { ...item, ...patch }

        // Jika kategori diubah, sesuaikan satuan default & placeholder
        if (patch.category && patch.category !== item.category) {
          const newCat = patch.category
          const allowedUnits = CATEGORY_UNITS[newCat]
          updated.unit = allowedUnits[0]

          if (newCat === 'Uang' && (!item.itemName || item.itemName === 'Beras')) {
            updated.itemName = 'Uang Tunai / Amplop'
          } else if (newCat === 'Beras' && (!item.itemName || item.itemName === 'Uang Tunai / Amplop')) {
            updated.itemName = 'Beras'
          }
        }

        return updated
      }),
    )
  }

  /** Mengubah draft formulir menjadi body request yang diterima backend. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const payloadItems: BuwuhanItemPayload[] = items
      .filter((item) => item.itemName.trim())
      .map((item) => {
        const estNum = item.estimatedValue === '' ? null : Number(item.estimatedValue)
        const qtyNum = Number(item.quantity) || 1

        return {
          category: item.category,
          itemName: item.itemName.trim(),
          quantity: qtyNum,
          unit: item.unit,
          // Jika Uang dan estimasi diisi, simpan nilainya; jika tidak, gunakan estimasi
          estimatedValue: item.category === 'Uang' && estNum === null && qtyNum > 1000 ? qtyNum : estNum,
        }
      })

    if (
      !giverName.trim() ||
      giverAddress.trim().length > 500 ||
      payloadItems.length === 0
    ) {
      return
    }

    try {
      await onSubmit({
        giverName: giverName.trim(),
        giverAddress: giverAddress.trim() || null,
        note: note.trim() || null,
        invitationId: defaultInvitationId || initialValue?.invitationId || null,
        invitationTitle: showInvitationField ? (invitationTitle.trim() || null) : null,
        items: payloadItems,
      })
    } catch {
      // Error ditangani oleh callback parent
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValue ? 'Ubah Catatan Buwuh' : 'Tambah Catatan Buwuh'}
      description="Pencatatan jenis bantuan dari tamu: Uang, Beras, atau Barang."
      maxWidth="2xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600">Nama Pemberi *</span>
            <input
              className={inputClass}
              value={giverName}
              onChange={(event) => setGiverName(event.target.value)}
              placeholder="Contoh: Bpk. Sutrisno"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600">
              Alamat / Asal Domisili
            </span>
            <input
              type="text"
              className={inputClass}
              value={giverAddress}
              onChange={(event) =>
                setGiverAddress(event.target.value.slice(0, 500))
              }
              placeholder="Contoh: Ds. Kedungwaru, Kec. Tulungagung"
              maxLength={500}
            />
            <span className="block text-right text-[10px] text-slate-400">
              {giverAddress.length}/500
            </span>
          </label>
        </div>

        {showInvitationField ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Acara Undangan</span>
              <input
                className={inputClass}
                value={invitationTitle}
                onChange={(event) => setInvitationTitle(event.target.value)}
                placeholder="Contoh: The Wedding of Budi & Siti"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Catatan</span>
              <input
                className={inputClass}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Opsional, misal: titipan keluarga"
              />
            </label>
          </div>
        ) : (
          <div className="w-full">
            <label className="space-y-1.5 block">
              <span className="text-[11px] font-bold text-slate-600">Catatan</span>
              <input
                className={inputClass}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Opsional, misal: titipan keluarga"
              />
            </label>
          </div>
        )}

        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Rincian Bantuan *
          </span>

          {items.map((item, index) => {
            const availableUnits = CATEGORY_UNITS[item.category]

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5 space-y-3"
              >
                {/* Pemilih 3 Kategori Utama */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Jenis:</span>
                    <div className="inline-flex rounded-xl bg-slate-200/60 p-0.5">
                      {BUWUHAN_CATEGORIES.map((cat) => {
                        const isSelected = item.category === cat
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => patchItem(index, { category: cat })}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-white text-ink shadow-2xs'
                                : 'text-slate-600 hover:text-ink'
                            }`}
                          >
                            {cat === 'Uang' && <Banknote size={13} className="text-emerald-600" />}
                            {cat === 'Beras' && <Wheat size={13} className="text-amber-600" />}
                            {cat === 'Barang' && <Gift size={13} className="text-indigo-600" />}
                            <span>{cat}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    disabled={items.length === 1}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-danger opacity-75 hover:bg-rose-50 hover:opacity-100 disabled:opacity-20"
                    aria-label="Hapus baris item"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                {/* Kolom Input Item */}
                <div className="grid items-end gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Nama / Keterangan Item
                    </label>
                    <input
                      className={inputClass}
                      value={item.itemName}
                      onChange={(event) => patchItem(index, { itemName: event.target.value })}
                      placeholder={
                        item.category === 'Uang'
                          ? 'Uang Tunai / Amplop'
                          : item.category === 'Beras'
                          ? 'Beras Ramos / Rojolele'
                          : 'Kulkas, Dispenser, Kipas, dll'
                      }
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      value={item.quantity}
                      onChange={(event) => patchItem(index, { quantity: event.target.value })}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Satuan
                    </label>
                    <select
                      className={inputClass}
                      value={item.unit}
                      onChange={(event) =>
                        patchItem(index, { unit: event.target.value as BuwuhanUnit })
                      }
                    >
                      {availableUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      {item.category === 'Uang' ? 'Nominal Uang (Rp)' : 'Estimasi Nilai (Rp)'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputClass}
                      value={formatThousands(item.estimatedValue)}
                      onChange={(event) => {
                        const raw = stripThousands(event.target.value)
                        patchItem(index, { estimatedValue: raw })
                      }}
                      placeholder={item.category === 'Uang' ? 'Contoh: 100.000' : 'Estimasi Rp (opsional)'}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
          >
            Tambah Baris Bantuan
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan Catatan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}