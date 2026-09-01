import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  BUWUHAN_UNITS,
  type ApiBuwuhan,
  type BuwuhanItemPayload,
  type BuwuhanPayload,
  type BuwuhanUnit,
} from '@/types/invitation-api'

export type BuwuhanFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: BuwuhanPayload) => void
  /** Data awal saat mode ubah; null berarti mode tambah baru */
  initialValue?: ApiBuwuhan | null
  isSubmitting?: boolean
}

type DraftItem = {
  itemName: string
  quantity: string
  unit: BuwuhanUnit
  category: string
  estimatedValue: string
}

const EMPTY_ITEM: DraftItem = {
  itemName: '',
  quantity: '1',
  unit: 'unit',
  category: '',
  estimatedValue: '',
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none'

/**
 * Modal formulir pencatatan buwuh: satu pemberi dengan satu atau lebih
 * item bantuan beserta estimasi nilainya.
 */
export function BuwuhanFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = null,
  isSubmitting = false,
}: BuwuhanFormModalProps) {
  const [giverName, setGiverName] = useState(initialValue?.giverName ?? '')
  const [note, setNote] = useState(initialValue?.note ?? '')
  const [items, setItems] = useState<DraftItem[]>(
    initialValue
      ? initialValue.items.map((item) => ({
          itemName: item.itemName,
          quantity: String(item.quantity),
          unit: item.unit,
          category: item.category ?? '',
          estimatedValue: item.estimatedValue === null ? '' : String(item.estimatedValue),
        }))
      : [{ ...EMPTY_ITEM }],
  )

  /** Memperbarui satu kolom pada baris item tertentu. */
  function patchItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  /** Mengubah draft formulir menjadi body request yang diterima backend. */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const payloadItems: BuwuhanItemPayload[] = items
      .filter((item) => item.itemName.trim())
      .map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity) || 1,
        unit: item.unit,
        category: item.category.trim() || null,
        estimatedValue: item.estimatedValue === '' ? null : Number(item.estimatedValue),
      }))

    if (!giverName.trim() || payloadItems.length === 0) return

    onSubmit({
      giverName: giverName.trim(),
      note: note.trim() || null,
      items: payloadItems,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValue ? 'Ubah Catatan Buwuh' : 'Tambah Catatan Buwuh'}
      description="Catat pemberi dan rincian barang bantuan beserta estimasi nilainya."
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
            <span className="text-[11px] font-bold text-slate-600">Catatan</span>
            <input
              className={inputClass}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Opsional"
            />
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600">Rincian Bantuan *</span>
          {items.map((item, index) => (
            <div key={index} className="grid items-end gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-12">
              <input
                className={`${inputClass} sm:col-span-4`}
                value={item.itemName}
                onChange={(event) => patchItem(index, { itemName: event.target.value })}
                placeholder="Nama barang, mis. Beras"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={`${inputClass} sm:col-span-2`}
                value={item.quantity}
                onChange={(event) => patchItem(index, { quantity: event.target.value })}
              />
              <select
                className={`${inputClass} sm:col-span-2`}
                value={item.unit}
                onChange={(event) => patchItem(index, { unit: event.target.value as BuwuhanUnit })}
              >
                {BUWUHAN_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                className={`${inputClass} sm:col-span-3`}
                value={item.estimatedValue}
                onChange={(event) => patchItem(index, { estimatedValue: event.target.value })}
                placeholder="Estimasi Rp"
              />
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                disabled={items.length === 1}
                className="rounded-xl p-2 text-slate-400 hover:bg-danger-light hover:text-danger disabled:opacity-30 sm:col-span-1"
                aria-label="Hapus baris item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
          >
            Tambah Item
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan Catatan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}