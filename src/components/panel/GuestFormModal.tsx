import { useState, type FormEvent } from 'react'
import { Save, User, Phone, Mail, Tag, MessageSquare } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { GUEST_CATEGORIES, type NewGuestInput } from '@/types/panel'
import { cn } from '@/lib/cn'

export type GuestFormModalProps = {
  /** Menentukan apakah modal formulir sedang terbuka */
  isOpen: boolean
  /** Callback untuk menutup modal formulir */
  onClose: () => void
  /** Callback saat data tamu valid dan siap disimpan */
  onSubmit: (input: NewGuestInput) => void
  /** Data awal untuk mode edit tamu. Berikan null atau undefined untuk mode tambah tamu baru. */
  initialValue?: NewGuestInput | null
}

type FormErrors = {
  name?: string
  category?: string
  phone?: string
  email?: string
}

const EMPTY_FORM: NewGuestInput = { name: '', category: '', phone: '', email: '', note: '' }

const labelClass = 'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600'
const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs'

/**
 * Komponen Modal Formulir Data Tamu (GuestFormModal).
 * Digunakan secara fleksibel untuk menambah tamu baru maupun mengubah data tamu yang sudah ada.
 * Dilengkapi dengan pemilihan kategori tamu interaktif (chips), nomor WhatsApp, validasi input, dan catatan.
 */
export function GuestFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = null,
}: GuestFormModalProps) {
  const isEditMode = initialValue !== null

  const [form, setForm] = useState<NewGuestInput>(() =>
    initialValue
      ? {
          name: initialValue.name,
          category: initialValue.category,
          phone: initialValue.phone ?? '',
          email: initialValue.email ?? '',
          note: initialValue.note ?? '',
        }
      : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  /**
   * Memperbarui satu ruas nilai formulir sekaligus menghapus pesan galat terkait.
   */
  function updateField(field: keyof NewGuestInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  /**
   * Memeriksa validitas input formulir dan mengembalikan objek galat.
   */
  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Nama tamu wajib diisi'
    } else if (form.name.trim().length < 3) {
      nextErrors.name = 'Nama tamu minimal 3 karakter'
    }

    if (!form.category) {
      nextErrors.category = 'Pilih salah satu kategori tamu'
    }

    const phone = form.phone?.trim()
    if (phone && !/^0\d{8,14}$/.test(phone)) {
      nextErrors.phone = 'Format nomor HP tidak valid (contoh: 08123456789)'
    }

    const email = form.email?.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Format email tidak valid (contoh: nama@email.com)'
    }

    return nextErrors
  }

  /**
   * Menangani pengiriman formulir saat tombol simpan diklik.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      name: form.name.trim(),
      category: form.category,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      note: form.note?.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Data Tamu' : 'Tambah Tamu Baru'}
      description={isEditMode ? 'Perbarui informasi rincian tamu undangan' : 'Daftarkan nama tamu untuk buku kehadiran & undangan digital'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama tamu */}
        <div>
          <label htmlFor="guest-name" className={labelClass}>
            <User size={13} className="text-primary" />
            <span>Nama Tamu</span>
            <span className="text-danger">*</span>
          </label>
          <input
            id="guest-name"
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Contoh: Bpk. H. Hendra Gunawan & Istri"
            className={fieldClass}
          />
          {errors.name && <p className="mt-1 text-[11px] text-danger font-medium">{errors.name}</p>}
        </div>

        {/* Kategori Tamu & Quick Chips */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="guest-category" className={labelClass}>
              <Tag size={13} className="text-primary" />
              <span>Kategori Tamu</span>
              <span className="text-danger">*</span>
            </label>
          </div>

          {/* Quick Selection Chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GUEST_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateField('category', cat)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border',
                  form.category === cat
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-white',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-[11px] text-danger font-medium">{errors.category}</p>
          )}
        </div>

        {/* Nomor HP WhatsApp */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="guest-phone" className={labelClass}>
              <Phone size={13} className="text-primary" />
              <span>Nomor HP (WhatsApp)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
          </div>
          <input
            id="guest-phone"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="Contoh: 081234567890"
            className={fieldClass}
          />
          {errors.phone && <p className="mt-1 text-[11px] text-danger font-medium">{errors.phone}</p>}
        </div>

        {/* Alamat Email */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="guest-email" className={labelClass}>
              <Mail size={13} className="text-primary" />
              <span>Alamat Email</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
          </div>
          <input
            id="guest-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="Contoh: bapak.hendra@gmail.com"
            className={fieldClass}
          />
          {errors.email && <p className="mt-1 text-[11px] text-danger font-medium">{errors.email}</p>}
        </div>

        {/* Catatan / Keterangan Tambahan */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="guest-note" className={labelClass}>
              <MessageSquare size={13} className="text-primary" />
              <span>Keterangan / Ucapan Singkat</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
          </div>
          <textarea
            id="guest-note"
            rows={3}
            value={form.note}
            onChange={(event) => updateField('note', event.target.value)}
            placeholder="Catatan khusus, sesi meja VIP, atau ucapan selamat dari tamu..."
            className={`${fieldClass} resize-none leading-relaxed`}
          />
        </div>

        {/* Tombol Aksi */}
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
