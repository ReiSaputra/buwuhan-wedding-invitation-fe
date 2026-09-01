import { useState, type FormEvent } from 'react'
import { Save, Type, Link2, User, Calendar, Clock, MapPin, Home, LayoutTemplate, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/hooks/useInvitationMutations'
import { parseApiError } from '@/lib/errorHandler'
import { cn } from '@/lib/cn'
import { useTemplates } from '@/hooks/useTemplates'
import type { ApiInvitation, InvitationPayload } from '@/types/invitation-api'

export type InvitationFormProps = {
  /** Data awal untuk mode edit. Berikan null untuk mode buat baru. */
  initialValue?: ApiInvitation | null
  /** Dipanggil saat data valid dan siap dikirim ke backend. Harus melempar error bila gagal. */
  onSubmit: (payload: InvitationPayload) => Promise<void>
  /** Dipanggil saat tombol Batal diklik */
  onCancel?: () => void
  /** Status loading dari mutation di komponen induk */
  isSubmitting?: boolean
}

type FormState = {
  title: string
  slug: string
  groomName: string
  groomFather: string
  groomMother: string
  brideName: string
  brideFather: string
  brideMother: string
  eventDate: string
  eventTime: string
  venue: string
  address: string
  templateId: string
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  groomName: '',
  groomFather: '',
  groomMother: '',
  brideName: '',
  brideFather: '',
  brideMother: '',
  eventDate: '',
  eventTime: '',
  venue: '',
  address: '',
  templateId: '',
}

type FormErrors = Partial<Record<keyof FormState, string>>

const labelClass =
  'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600'
const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs'
const sectionClass = 'rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3'

/**
 * Mengubah data undangan dari backend menjadi nilai awal formulir.
 */
function toFormState(data: ApiInvitation): FormState {
  const groom = data.couples.find((c) => c.type === 'GROOM')
  const bride = data.couples.find((c) => c.type === 'BRIDE')

  return {
    title: data.title,
    slug: data.slug,
    groomName: groom?.name ?? '',
    groomFather: groom?.fatherName ?? '',
    groomMother: groom?.motherName ?? '',
    brideName: bride?.name ?? '',
    brideFather: bride?.fatherName ?? '',
    brideMother: bride?.motherName ?? '',
    eventDate: data.eventDate ? data.eventDate.slice(0, 10) : '',
    eventTime: data.eventTime ?? '',
    venue: data.venue ?? '',
    address: data.address ?? '',
    templateId: data.template?.id ?? '',
  }
}

/**
 * Memecah teks waktu acara backend ("09:00 - 12:00 WIB") menjadi
 * jam mulai dan jam selesai untuk dua input bertipe time.
 *
 * @param eventTime - Teks waktu dari backend, boleh kosong
 * @returns Pasangan [jamMulai, jamSelesai]
 */
function parseEventTime(eventTime?: string | null): [string, string] {
  if (!eventTime) return ['', '']
  const parts = eventTime.replace(' WIB', '').split(' - ')
  return [parts[0] ?? '', parts[1] ?? '']
}

/**
 * Formulir data undangan pernikahan.
 * Dipakai bersama oleh alur buat undangan baru dan alur ubah undangan.
 * Validasi di sini disamakan dengan aturan Zod di backend (invitation.schema.ts)
 * agar kesalahan tertangkap sebelum request dikirim.
 *
 * @param props - Properti InvitationForm (initialValue, onSubmit, onCancel, isSubmitting)
 */
export function InvitationForm({
  initialValue = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InvitationFormProps) {
  const isEditMode = initialValue !== null
  // Nilai awal dihitung sekali saat komponen dipasang. Untuk mode ubah, induk
  // memberi prop key={invitation.id} sehingga formulir dipasang ulang ketika
  // undangan yang diedit berganti. Pola ini menggantikan reset lewat useEffect.
  const [form, setForm] = useState<FormState>(() =>
    initialValue ? toFormState(initialValue) : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Daftar template diambil lewat hook bersama agar cache-nya dipakai ulang
  const { templates, isLoading: isLoadingTemplates } = useTemplates()

  // Di mode buat baru, slug ikut judul otomatis sampai user mengetik slug sendiri.
  // Di mode ubah, slug dianggap sudah ditentukan sehingga tidak ditimpa judul.
  const [slugTouched, setSlugTouched] = useState(isEditMode)

  // Waktu acara backend berbentuk satu teks ("09:00 - 12:00 WIB"),
  // sedangkan UI memakai dua input terpisah.
  const [initialStart, initialEnd] = parseEventTime(initialValue?.eventTime)
  const [startTime, setStartTime] = useState(initialStart)
  const [endTime, setEndTime] = useState(initialEnd)

  /**
   * Memperbarui satu ruas formulir dan menghapus pesan galatnya.
   */
  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Judul mengisi slug otomatis selama slug belum pernah diubah manual
      if (field === 'title' && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  /**
   * Memeriksa isian formulir mengikuti aturan validasi backend.
   */
  function validate(): FormErrors {
    const next: FormErrors = {}

    if (!form.title.trim()) next.title = 'Judul undangan wajib diisi'
    else if (form.title.trim().length > 255) next.title = 'Judul maksimal 255 karakter'

    const slug = form.slug.trim()
    if (!slug) next.slug = 'Slug wajib diisi'
    else if (slug.length < 3) next.slug = 'Slug minimal 3 karakter'
    else if (slug.length > 100) next.slug = 'Slug maksimal 100 karakter'
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      next.slug = 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'

    // Backend mewajibkan TEPAT 2 mempelai dengan data lengkap
    if (!form.groomName.trim()) next.groomName = 'Nama mempelai pria wajib diisi'
    if (!form.groomFather.trim()) next.groomFather = 'Nama ayah wajib diisi'
    if (!form.groomMother.trim()) next.groomMother = 'Nama ibu wajib diisi'
    if (!form.brideName.trim()) next.brideName = 'Nama mempelai wanita wajib diisi'
    if (!form.brideFather.trim()) next.brideFather = 'Nama ayah wajib diisi'
    if (!form.brideMother.trim()) next.brideMother = 'Nama ibu wajib diisi'

    if (form.venue.trim().length > 255) next.venue = 'Nama lokasi maksimal 255 karakter'
    if (form.address.trim().length > 1000) next.address = 'Alamat maksimal 1000 karakter'
    if (form.eventTime.trim().length > 100) next.eventTime = 'Waktu maksimal 100 karakter'

    return next
  }

  /**
   * Menyusun payload sesuai kontrak backend, membuang field opsional yang kosong.
   */
  function buildPayload(): InvitationPayload {
    const payload: InvitationPayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      couples: [
        {
          type: 'GROOM',
          name: form.groomName.trim(),
          fatherName: form.groomFather.trim(),
          motherName: form.groomMother.trim(),
        },
        {
          type: 'BRIDE',
          name: form.brideName.trim(),
          fatherName: form.brideFather.trim(),
          motherName: form.brideMother.trim(),
        },
      ],
    }

    if (form.eventDate) {
      // Ubah format "YYYY-MM-DD" dari input type="date" menjadi format ISO string lengkap "YYYY-MM-DDT00:00:00.000Z"
      const dateObj = new Date(form.eventDate)
      payload.eventDate = dateObj.toISOString()
    }
    
    // Gabung startTime dan endTime
    if (startTime || endTime) {
      payload.eventTime = endTime ? `${startTime} - ${endTime} WIB` : `${startTime} WIB`
    }
    
    if (form.venue.trim()) payload.venue = form.venue.trim()
    if (form.address.trim()) payload.address = form.address.trim()
    if (form.templateId) payload.templateId = form.templateId

    return payload
  }

  /**
   * Mengirim formulir, lalu memetakan galat backend ke masing-masing kolom.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await onSubmit(buildPayload())
      if (isEditMode) {
        setSuccessMessage('Undangan berhasil di edit')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (error) {
      const parsed = parseApiError(error)
      const mapped: FormErrors = {}

      // Backend mengirim nama field aslinya (title, slug, couples, ...)
      if (parsed.fieldErrors.title) mapped.title = parsed.fieldErrors.title[0]
      if (parsed.fieldErrors.slug) mapped.slug = parsed.fieldErrors.slug[0]
      if (parsed.fieldErrors.eventTime) mapped.eventTime = parsed.fieldErrors.eventTime[0]
      if (parsed.fieldErrors.venue) mapped.venue = parsed.fieldErrors.venue[0]
      if (parsed.fieldErrors.address) mapped.address = parsed.fieldErrors.address[0]

      setErrors(mapped)
      setGeneralError(
        parsed.generalMessage ??
          parsed.allMessages[0] ??
          'Gagal menyimpan undangan. Coba lagi.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          {successMessage}
        </div>
      )}
      
      {generalError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-danger">
          {generalError}
        </div>
      )}

      {/* Judul undangan */}
      <div>
        <label htmlFor="inv-title" className={labelClass}>
          <Type size={13} className="text-primary" />
          <span>Judul Undangan</span>
        </label>
        <input
          id="inv-title"
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Contoh: Pernikahan Hanung & Ratna"
          className={cn(fieldClass, errors.title && 'border-red-300 focus:ring-red-200')}
        />
        {errors.title && <p className="mt-1 text-[11px] font-medium text-danger">{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="inv-slug" className={labelClass}>
          <Link2 size={13} className="text-primary" />
          <span>Slug Tautan Publik</span>
        </label>
        <input
          id="inv-slug"
          type="text"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true)
            updateField('slug', slugify(e.target.value))
          }}
          placeholder="hanung-ratna"
          className={cn(fieldClass, errors.slug && 'border-red-300 focus:ring-red-200')}
        />
        <p className="mt-1 text-[11px] text-muted">
          Alamat undangan: <span className="font-semibold text-slate-600">/undangan/{form.slug || '...'}</span>
        </p>
        {errors.slug && <p className="mt-1 text-[11px] font-medium text-danger">{errors.slug}</p>}
      </div>

      {/* Mempelai Pria */}
      <div className={sectionClass}>
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <User size={13} />
          <span>Mempelai Pria</span>
        </p>

        <div>
          <label htmlFor="groom-name" className={labelClass}>Nama Lengkap</label>
          <input
            id="groom-name"
            type="text"
            value={form.groomName}
            onChange={(e) => updateField('groomName', e.target.value)}
            placeholder="Hanung Saputra"
            className={cn(fieldClass, errors.groomName && 'border-red-300')}
          />
          {errors.groomName && <p className="mt-1 text-[11px] font-medium text-danger">{errors.groomName}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="groom-father" className={labelClass}>Nama Ayah</label>
            <input
              id="groom-father"
              type="text"
              value={form.groomFather}
              onChange={(e) => updateField('groomFather', e.target.value)}
              className={cn(fieldClass, errors.groomFather && 'border-red-300')}
            />
            {errors.groomFather && <p className="mt-1 text-[11px] font-medium text-danger">{errors.groomFather}</p>}
          </div>
          <div>
            <label htmlFor="groom-mother" className={labelClass}>Nama Ibu</label>
            <input
              id="groom-mother"
              type="text"
              value={form.groomMother}
              onChange={(e) => updateField('groomMother', e.target.value)}
              className={cn(fieldClass, errors.groomMother && 'border-red-300')}
            />
            {errors.groomMother && <p className="mt-1 text-[11px] font-medium text-danger">{errors.groomMother}</p>}
          </div>
        </div>
      </div>

      {/* Mempelai Wanita */}
      <div className={sectionClass}>
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
          <User size={13} />
          <span>Mempelai Wanita</span>
        </p>

        <div>
          <label htmlFor="bride-name" className={labelClass}>Nama Lengkap</label>
          <input
            id="bride-name"
            type="text"
            value={form.brideName}
            onChange={(e) => updateField('brideName', e.target.value)}
            placeholder="Ratna Dewi"
            className={cn(fieldClass, errors.brideName && 'border-red-300')}
          />
          {errors.brideName && <p className="mt-1 text-[11px] font-medium text-danger">{errors.brideName}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="bride-father" className={labelClass}>Nama Ayah</label>
            <input
              id="bride-father"
              type="text"
              value={form.brideFather}
              onChange={(e) => updateField('brideFather', e.target.value)}
              className={cn(fieldClass, errors.brideFather && 'border-red-300')}
            />
            {errors.brideFather && <p className="mt-1 text-[11px] font-medium text-danger">{errors.brideFather}</p>}
          </div>
          <div>
            <label htmlFor="bride-mother" className={labelClass}>Nama Ibu</label>
            <input
              id="bride-mother"
              type="text"
              value={form.brideMother}
              onChange={(e) => updateField('brideMother', e.target.value)}
              className={cn(fieldClass, errors.brideMother && 'border-red-300')}
            />
            {errors.brideMother && <p className="mt-1 text-[11px] font-medium text-danger">{errors.brideMother}</p>}
          </div>
        </div>
      </div>

      {/* Tanggal & waktu */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="inv-date" className={labelClass}>
            <Calendar size={13} className="text-primary" />
            <span>Tanggal Acara</span>
          </label>
          <input
            id="inv-date"
            type="date"
            value={form.eventDate}
            onChange={(e) => updateField('eventDate', e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Clock size={13} className="text-primary" />
            <span>Waktu Acara</span>
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={cn(fieldClass, "mt-0")}
            />
            <span className="text-sm font-medium text-slate-400">-</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={cn(fieldClass, "mt-0")}
            />
          </div>
          {errors.eventTime && <p className="mt-1 text-[11px] font-medium text-danger">{errors.eventTime}</p>}
        </div>
      </div>

      {/* Lokasi */}
      <div>
        <label htmlFor="inv-venue" className={labelClass}>
          <MapPin size={13} className="text-primary" />
          <span>Nama Lokasi</span>
        </label>
        <input
          id="inv-venue"
          type="text"
          value={form.venue}
          onChange={(e) => updateField('venue', e.target.value)}
          placeholder="Gedung Graha Sabha Pramana"
          className={cn(fieldClass, errors.venue && 'border-red-300')}
        />
        {errors.venue && <p className="mt-1 text-[11px] font-medium text-danger">{errors.venue}</p>}
      </div>

      <div>
        <label htmlFor="inv-address" className={labelClass}>
          <Home size={13} className="text-primary" />
          <span>Alamat Lengkap</span>
        </label>
        <textarea
          id="inv-address"
          rows={3}
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Jl. Contoh No. 12, Sleman, DI Yogyakarta"
          className={cn(fieldClass, 'resize-none', errors.address && 'border-red-300')}
        />
        {errors.address && <p className="mt-1 text-[11px] font-medium text-danger">{errors.address}</p>}
      </div>

      {/* Template */}
      <div>
        <label className={labelClass}>
          <LayoutTemplate size={13} className="text-primary" />
          <span>Pilih Template Tema</span>
        </label>
        
        {isLoadingTemplates ? (
          <div className="mt-2 flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <span className="text-xs font-medium text-slate-400">Memuat template...</span>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => updateField('templateId', tpl.id)}
                className={cn(
                  "relative flex flex-col items-center overflow-hidden rounded-2xl border-2 p-2 text-left transition-all",
                  form.templateId === tpl.id
                    ? "border-primary bg-indigo-50/30"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50",
                  errors.templateId && "border-red-300"
                )}
              >
                <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 relative group">
                  {tpl.thumbnailUrl ? (
                    <img src={tpl.thumbnailUrl} alt={tpl.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-300">
                      <LayoutTemplate size={28} className="mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>
                <div className="w-full px-1 text-center">
                  <span className="block truncate text-xs font-bold text-ink" title={tpl.name}>
                    {tpl.name}
                  </span>
                  {tpl.description && (
                    <span className="mt-0.5 block truncate text-[10px] text-muted" title={tpl.description}>
                      {tpl.description}
                    </span>
                  )}
                </div>
                {form.templateId === tpl.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white shadow-sm ring-2 ring-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {errors.templateId && <p className="mt-1 text-[11px] font-medium text-danger">{errors.templateId}</p>}
      </div>

      {/* Aksi */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
        )}
        <Button type="submit" variant="primary" icon={<Save size={15} />} isLoading={isSubmitting}>
          {isEditMode ? 'Simpan Perubahan' : 'Buat Undangan'}
        </Button>
      </div>
    </form>
  )
}