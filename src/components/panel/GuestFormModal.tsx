import { useEffect, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { GUEST_CATEGORIES, type NewGuestInput } from '@/types/panel'

export type GuestFormModalProps = {
  /** Menentukan apakah modal sedang terbuka */
  isOpen: boolean
  /** Callback untuk menutup modal */
  onClose: () => void
  /** Callback saat data tamu valid dan siap disimpan */
  onSubmit: (input: NewGuestInput) => void
  /** Data awal untuk mode ubah. Biarkan kosong untuk mode tambah. */
  initialValue?: NewGuestInput | null
}

type FormErrors = {
  name?: string
  category?: string
  phone?: string
}

const EMPTY_FORM: NewGuestInput = { name: '', category: '', phone: '', note: '' }

const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500'
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-ink placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

/**
 * Modal formulir tamu Buku Tamu, dipakai untuk dua keperluan sekaligus:
 * menambah tamu baru dan mengubah data tamu yang sudah ada.
 *
 * Validasi: nama dan kategori wajib diisi, nomor HP hanya boleh angka
 * berawalan 0 bila diisi.
 *
 * @param props - Properti GuestFormModal (isOpen, onClose, onSubmit, initialValue)
 */
export function GuestFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = null,
}: GuestFormModalProps) {
  const isEditMode = initialValue !== null
  const [form, setForm] = useState<NewGuestInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  // Mengisi ulang formulir setiap kali modal dibuka, sesuai mode tambah atau ubah
  useEffect(() => {
    if (isOpen) {
      setForm(
        initialValue
          ? {
              name: initialValue.name,
              category: initialValue.category,
              phone: initialValue.phone ?? '',
              note: initialValue.note ?? '',
            }
          : EMPTY_FORM,
      )
      setErrors({})
    }
  }, [isOpen, initialValue])

  /** Memperbarui satu ruas formulir sekaligus menghapus pesan galatnya. */
  function updateField(field: keyof NewGuestInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  /** Memeriksa isi formulir dan mengembalikan daftar galat. */
  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Nama tamu wajib diisi'
    } else if (form.name.trim().length < 3) {
      nextErrors.name = 'Nama tamu minimal 3 karakter'
    }

    if (!form.category) {
      nextErrors.category = 'Pilih salah satu kategori'
    }

    const phone = form.phone?.trim()
    if (phone && !/^0\d{8,14}$/.test(phone)) {
      nextErrors.phone = 'Format tidak valid, contoh: 08123456789'
    }

    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      name: form.name.trim(),
      category: form.category,
      phone: form.phone?.trim() || undefined,
      note: form.note?.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Data Tamu' : 'Tambah Tamu Baru'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama tamu */}
        <div>
          <label htmlFor="guest-name" className={labelClass}>
            Nama Tamu
          </label>
          <input
            id="guest-name"
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Masukkan nama tamu"
            className={fieldClass}
          />
          {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name}</p>}
        </div>

        {/* Kategori & Nomor HP berdampingan */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guest-category" className={labelClass}>
              Kategori
            </label>
            <select
              id="guest-category"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              className={fieldClass}
            >
              <option value="">Pilih Kategori</option>
              {GUEST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-[11px] text-danger">{errors.category}</p>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="guest-phone" className={labelClass}>
                Nomor HP
              </label>
              <span className="text-[10px] text-slate-400">opsional</span>
            </div>
            <input
              id="guest-phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="Contoh: 08123456789"
              className={fieldClass}
            />
            {errors.phone && <p className="mt-1 text-[11px] text-danger">{errors.phone}</p>}
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="guest-note" className={labelClass}>
              Keterangan
            </label>
            <span className="text-[10px] text-slate-400">opsional</span>
          </div>
          <textarea
            id="guest-note"
            rows={3}
            value={form.note}
            onChange={(event) => updateField('note', event.target.value)}
            placeholder="Tambahkan catatan khusus, hubungan keluarga, atau permintaan khusus..."
            className={`${fieldClass} resize-none leading-relaxed`}
          />
        </div>

        {/* Tombol aksi */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" icon={<Save size={15} />}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Tamu'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
