import { useEffect, useState } from 'react'
import { AlertTriangle, ImageOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type {
  AdminTemplate,
  CreateTemplatePayload,
  EventCategory,
  PlanTier,
  UpdateTemplatePayload,
} from '@/types/admin'

/** Aturan slug harus sama persis dengan `slugSchema` di backend. */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const TIERS: PlanTier[] = ['FREE', 'PRO', 'MAX']

const CATEGORIES: Array<{ value: EventCategory; label: string }> = [
  { value: 'WEDDING', label: 'Pernikahan' },
  { value: 'KHITANAN', label: 'Khitanan' },
  { value: 'RASULAN', label: 'Rasulan' },
  { value: 'AQIQAH', label: 'Aqiqah' },
]

type FormState = {
  name: string
  slug: string
  tier: PlanTier
  eventCategory: EventCategory
  previewImageUrl: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  tier: 'FREE',
  eventCategory: 'WEDDING',
  previewImageUrl: '',
  isActive: true,
}

export type TemplateFormModalProps = {
  isOpen: boolean
  /** Template yang diedit. null berarti mode tambah baru. */
  template: AdminTemplate | null
  isSubmitting?: boolean
  /** Pesan galat dari backend (misal slug bentrok). */
  serverError?: string | null
  onClose: () => void
  onCreate: (payload: CreateTemplatePayload) => void
  onUpdate: (id: string, payload: UpdateTemplatePayload) => void
}

/** Mengubah nama menjadi slug otomatis: "Elegan Rose 2" → "elegan-rose-2". */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Modal formulir tambah / ubah template katalog.
 * Mode edit hanya mengirim field yang benar-benar berubah, sesuai aturan
 * backend "minimal satu field harus diisi untuk update".
 */
export function TemplateFormModal({
  isOpen,
  template,
  isSubmitting = false,
  serverError,
  onClose,
  onCreate,
  onUpdate,
}: TemplateFormModalProps) {
  const isEdit = template !== null

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Isi ulang form setiap kali modal dibuka atau target template berganti
  useEffect(() => {
    if (!isOpen) return

    setErrors({})
    setSlugTouched(isEdit)
    setForm(
      template
        ? {
            name: template.name,
            slug: template.slug,
            tier: template.tier,
            eventCategory: (template.eventCategory as EventCategory) || 'WEDDING',
            previewImageUrl: template.previewImageUrl ?? '',
            isActive: template.isActive,
          }
        : EMPTY_FORM,
    )
  }, [isOpen, template, isEdit])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /** Validasi klien yang mencerminkan createTemplateSchema di backend. */
  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) next.name = 'Nama template wajib diisi'
    else if (form.name.trim().length > 255) next.name = 'Nama maksimal 255 karakter'

    const slug = form.slug.trim().toLowerCase()
    if (slug.length < 3) next.slug = 'Slug minimal 3 karakter'
    else if (slug.length > 100) next.slug = 'Slug maksimal 100 karakter'
    else if (!SLUG_RE.test(slug))
      next.slug = 'Hanya huruf kecil, angka, dan tanda hubung (-)'

    const url = form.previewImageUrl.trim()
    if (!url) next.previewImageUrl = 'URL pratinjau wajib diisi'
    else if (!/^https?:\/\/.+/i.test(url))
      next.previewImageUrl = 'URL harus diawali http:// atau https://'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    const payload: CreateTemplatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      tier: form.tier,
      eventCategory: form.eventCategory,
      previewImageUrl: form.previewImageUrl.trim(),
      isActive: form.isActive,
    }

    if (!template) {
      onCreate(payload)
      return
    }

    // Mode edit: kirim hanya field yang berubah
    const diff: UpdateTemplatePayload = {}
    if (payload.name !== template.name) diff.name = payload.name
    if (payload.slug !== template.slug) diff.slug = payload.slug
    if (payload.tier !== template.tier) diff.tier = payload.tier
    if (payload.eventCategory !== template.eventCategory)
      diff.eventCategory = payload.eventCategory
    if (payload.previewImageUrl !== (template.previewImageUrl ?? ''))
      diff.previewImageUrl = payload.previewImageUrl
    if (payload.isActive !== template.isActive) diff.isActive = payload.isActive

    if (Object.keys(diff).length === 0) {
      onClose()
      return
    }

    onUpdate(template.id, diff)
  }

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10'
  const labelClass = 'text-[11px] font-bold tracking-wider text-slate-600 uppercase'
  const errorClass = 'mt-1 text-[11px] font-medium text-rose-600'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Ubah Template' : 'Tambah Template Baru'}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {serverError && (
          <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Nama */}
        <div>
          <label htmlFor="template-name" className={labelClass}>
            Nama Template
          </label>
          <input
            id="template-name"
            type="text"
            value={form.name}
            maxLength={255}
            onChange={(e) => {
              const value = e.target.value
              setField('name', value)
              // Slug ikut nama selama admin belum menyuntingnya sendiri
              if (!slugTouched) setField('slug', slugify(value))
            }}
            placeholder="Elegan Rose Gold"
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="template-slug" className={labelClass}>
            Slug
          </label>
          <input
            id="template-slug"
            type="text"
            value={form.slug}
            maxLength={100}
            onChange={(e) => {
              setSlugTouched(true)
              setField('slug', e.target.value.toLowerCase())
            }}
            placeholder="elegan-rose-gold"
            className={`${inputClass} font-mono`}
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Dipakai sebagai kunci komponen tema di frontend. Mengubah slug template yang sudah
            dipakai bisa membuat undangan lama gagal merender.
          </p>
          {errors.slug && <p className={errorClass}>{errors.slug}</p>}
        </div>

        {/* Tier & Kategori */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="template-tier" className={labelClass}>
              Paket Tier
            </label>
            <select
              id="template-tier"
              value={form.tier}
              onChange={(e) => setField('tier', e.target.value as PlanTier)}
              className={inputClass}
            >
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="template-category" className={labelClass}>
              Kategori Acara
            </label>
            <select
              id="template-category"
              value={form.eventCategory}
              onChange={(e) => setField('eventCategory', e.target.value as EventCategory)}
              className={inputClass}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* URL pratinjau + preview */}
        <div>
          <label htmlFor="template-preview" className={labelClass}>
            URL Gambar Pratinjau
          </label>
          <input
            id="template-preview"
            type="url"
            value={form.previewImageUrl}
            onChange={(e) => setField('previewImageUrl', e.target.value)}
            placeholder="https://cdn.buwuhan.com/templates/elegan-rose.jpg"
            className={inputClass}
          />
          {errors.previewImageUrl && <p className={errorClass}>{errors.previewImageUrl}</p>}

          <div className="mt-2 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/^https?:\/\/.+/i.test(form.previewImageUrl.trim()) ? (
              <img
                src={form.previewImageUrl.trim()}
                alt="Pratinjau template"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-300">
                <ImageOff className="h-7 w-7" />
                <span className="mt-1 text-[11px] font-medium">Belum ada pratinjau</span>
              </div>
            )}
          </div>
        </div>

        {/* Status aktif */}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
          />
          <span className="text-xs font-medium text-slate-700">
            Tampilkan di katalog publik (aktif)
          </span>
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isSubmitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Template'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}