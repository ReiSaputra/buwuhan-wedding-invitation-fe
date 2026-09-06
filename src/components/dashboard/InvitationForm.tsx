import {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type FormEvent,
} from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AnimatedStatusIcon } from '@/components/ui/AnimatedStatusIcon'
import { slugify } from '@/hooks/useInvitationMutations'
import { parseApiError } from '@/lib/errorHandler'
import { cn } from '@/lib/cn'
import { useTemplates } from '@/hooks/useTemplates'
import type {
  ApiInvitation,
  InvitationPayload,
} from '@/types/invitation-api'

export type InvitationCategory = 'wedding' | 'khitanan' | 'rasulan' | 'aqiqah'

export const INVITATION_CATEGORIES: Array<{
  id: InvitationCategory
  apiCategory: 'WEDDING' | 'KHITANAN' | 'RASULAN' | 'AQIQAH'
  title: string
  subtitle: string
  badge: string
  colorClass: string
  bgBorderClass: string
}> = [
  {
    id: 'wedding',
    apiCategory: 'WEDDING',
    title: 'Pernikahan',
    subtitle: 'Akad nikah & resepsi perkawinan dengan data mempelai pria dan wanita.',
    badge: 'Pernikahan',
    colorClass: 'text-pink-600 bg-pink-50 border-pink-200',
    bgBorderClass: 'border-pink-200 hover:border-pink-400 hover:bg-pink-50/40',
  },
  {
    id: 'khitanan',
    apiCategory: 'KHITANAN',
    title: 'Khitanan',
    subtitle: 'Tasyakuran walimatul khitan untuk ananda tercinta.',
    badge: 'Khitanan',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    bgBorderClass: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40',
  },
  {
    id: 'rasulan',
    apiCategory: 'RASULAN',
    title: 'Rasulan',
    subtitle: 'Tasyakuran tradisi rasulan / merti desa / sedekah bumi.',
    badge: 'Rasulan',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    bgBorderClass: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/40',
  },
  {
    id: 'aqiqah',
    apiCategory: 'AQIQAH',
    title: 'Aqiqah',
    subtitle: 'Tasyakuran aqiqah kelahiran ananda & doa bersama keluarga.',
    badge: 'Aqiqah',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    bgBorderClass: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/40',
  },
]

export type InvitationFormHandle = {
  /** Menjalankan submit formulir secara programatis, mengembalikan true jika berhasil */
  submit: () => Promise<boolean>
  /** Mengembalikan formulir ke nilai awal */
  reset: () => void
  /** Status apakah ada perubahan yang belum disimpan */
  isDirty: boolean
}

export type InvitationFormProps = {
  /** ID atribut form HTML */
  id?: string
  /** Data awal untuk mode edit. Berikan null untuk mode buat baru. */
  initialValue?: ApiInvitation | null
  /** Dipanggil saat data valid dan siap dikirim ke backend. Harus melempar error bila gagal. */
  onSubmit: (payload: InvitationPayload) => Promise<void>
  /** Dipanggil saat tombol Batal diklik */
  onCancel?: () => void
  /** Status loading dari mutation di komponen induk */
  isSubmitting?: boolean
  /** Apakah menyembunyikan tombol submit di dalam formulir ini */
  hideSubmitButton?: boolean
  /** Callback saat status perubahan data (isDirty) berubah */
  onDirtyChange?: (isDirty: boolean) => void
  /** Kategori awal yang dipilih (opsional) */
  defaultCategory?: InvitationCategory
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
  'block text-[11px] font-bold uppercase tracking-wider text-slate-600'
const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs'
const sectionClass = 'rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3'

/**
 * Mendeteksi jenis undangan dari eventCategory atau judul yang tersimpan di database.
 */
function detectCategory(data?: ApiInvitation | null): InvitationCategory {
  if (!data) return 'wedding'
  const cat = (data.eventCategory ?? '').toUpperCase()
  if (cat === 'KHITANAN') return 'khitanan'
  if (cat === 'RASULAN') return 'rasulan'
  if (cat === 'AQIQAH') return 'aqiqah'
  if (cat === 'WEDDING' || cat === 'PERNIKAHAN') return 'wedding'

  const titleLower = (data.title ?? '').toLowerCase()
  if (titleLower.includes('khitan')) return 'khitanan'
  if (titleLower.includes('rasul')) return 'rasulan'
  if (titleLower.includes('aqiqah') || titleLower.includes('akikah')) return 'aqiqah'
  return 'wedding'
}

/**
 * Mengubah data undangan dari backend menjadi nilai awal formulir.
 */
function toFormState(data: ApiInvitation): FormState {
  const groom = data.couples?.find((c) => c.type === 'GROOM')
  const bride = data.couples?.find((c) => c.type === 'BRIDE')

  return {
    title: data.title ?? '',
    slug: data.slug ?? '',
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
 * Memecah teks waktu acara backend ("09:00 - 12:00 WIB" atau "08:00 WIB")
 * menjadi jam mulai dan jam selesai untuk input bertipe time.
 */
function parseEventTime(eventTime?: string | null): [string, string] {
  if (!eventTime) return ['', '']
  const clean = eventTime.replace(' WIB', '').trim()
  if (clean.includes(' - ')) {
    const parts = clean.split(' - ')
    return [parts[0] ?? '', parts[1] ?? '']
  }
  return [clean, '']
}

/**
 * Formulir data undangan pernikahan, khitanan, rasulan, dan aqiqah.
 * Menampilkan pemilihan jenis undangan di awal sebelum mengisi formulir.
 */
export const InvitationForm = forwardRef<InvitationFormHandle, InvitationFormProps>(
  function InvitationForm(
    {
      id,
      initialValue = null,
      onSubmit,
      onCancel,
      isSubmitting = false,
      hideSubmitButton = false,
      onDirtyChange,
      defaultCategory,
    }: InvitationFormProps,
    ref,
  ) {
    const isEditMode = initialValue !== null

    // Kategori terpilih: di mode edit langsung deteksi, di mode buat baru null (menampilkan pilihan jenis di awal)
    const [selectedCategory, setSelectedCategory] = useState<InvitationCategory | null>(() => {
      if (isEditMode) return detectCategory(initialValue)
      return defaultCategory ?? null
    })

    const [form, setForm] = useState<FormState>(() =>
      initialValue ? toFormState(initialValue) : EMPTY_FORM,
    )
    const [errors, setErrors] = useState<FormErrors>({})
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [popupState, setPopupState] = useState<{
      isOpen: boolean
      status: 'success' | 'error'
      title: string
      message: string
    }>({
      isOpen: false,
      status: 'success',
      title: '',
      message: '',
    })

    // Daftar template diambil lewat hook bersama agar cache-nya dipakai ulang
    const { templates, isLoading: isLoadingTemplates } = useTemplates()

    // Di mode buat baru, slug ikut judul otomatis sampai user mengetik slug sendiri.
    const [slugTouched, setSlugTouched] = useState(isEditMode)

    // Waktu acara backend
    const [initialStart, initialEnd] = parseEventTime(initialValue?.eventTime)
    const [startTime, setStartTime] = useState(initialStart)
    const [endTime, setEndTime] = useState(initialEnd)

    const currentCategory = selectedCategory ?? 'wedding'

    /**
     * Menghitung apakah ada perubahan data pada formulir dibanding data awal.
     */
    const isDirty = useMemo(() => {
      if (!initialValue) {
        return (
          Boolean(form.title) ||
          Boolean(form.slug) ||
          Boolean(form.groomName) ||
          Boolean(form.groomFather) ||
          Boolean(form.groomMother) ||
          Boolean(form.brideName) ||
          Boolean(form.brideFather) ||
          Boolean(form.brideMother) ||
          Boolean(form.eventDate) ||
          Boolean(startTime) ||
          Boolean(endTime) ||
          Boolean(form.venue) ||
          Boolean(form.address) ||
          Boolean(form.templateId)
        )
      }

      const init = toFormState(initialValue)
      const [initStart, initEnd] = parseEventTime(initialValue.eventTime)

      return (
        form.title !== init.title ||
        form.slug !== init.slug ||
        form.groomName !== init.groomName ||
        form.groomFather !== init.groomFather ||
        form.groomMother !== init.groomMother ||
        form.brideName !== init.brideName ||
        form.brideFather !== init.brideFather ||
        form.brideMother !== init.brideMother ||
        form.eventDate !== init.eventDate ||
        startTime !== initStart ||
        endTime !== initEnd ||
        form.venue !== init.venue ||
        form.address !== init.address ||
        form.templateId !== init.templateId
      )
    }, [form, startTime, endTime, initialValue])

    // Beritahu parent saat isDirty berubah
    useEffect(() => {
      onDirtyChange?.(isDirty)
    }, [isDirty, onDirtyChange])

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
     * Memeriksa isian formulir mengikuti aturan validasi sesuai jenis undangan.
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

      if (currentCategory === 'wedding') {
        if (!form.groomName.trim()) next.groomName = 'Nama mempelai pria wajib diisi'
        if (!form.groomFather.trim()) next.groomFather = 'Nama ayah wajib diisi'
        if (!form.groomMother.trim()) next.groomMother = 'Nama ibu wajib diisi'
        if (!form.brideName.trim()) next.brideName = 'Nama mempelai wanita wajib diisi'
        if (!form.brideFather.trim()) next.brideFather = 'Nama ayah wajib diisi'
        if (!form.brideMother.trim()) next.brideMother = 'Nama ibu wajib diisi'
      }

      if (form.venue.trim().length > 255) next.venue = 'Nama lokasi maksimal 255 karakter'
      if (form.address.trim().length > 1000) next.address = 'Alamat maksimal 1000 karakter'
      if (form.eventTime.trim().length > 100) next.eventTime = 'Waktu maksimal 100 karakter'

      return next
    }

    /**
     * Menyusun payload sesuai spesifikasi API backend POST /invitations dan PATCH /invitations/:id.
     */
    function buildPayload(): InvitationPayload {
      const payload: InvitationPayload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
      }

      if (currentCategory === 'wedding') {
        payload.eventCategory = 'WEDDING'
        payload.couples = [
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
        ]
      } else if (currentCategory === 'khitanan') {
        payload.eventCategory = 'KHITANAN'
      } else if (currentCategory === 'rasulan') {
        payload.eventCategory = 'RASULAN'
      } else if (currentCategory === 'aqiqah') {
        payload.eventCategory = 'AQIQAH'
      }

      if (form.eventDate) {
        const dateObj = new Date(form.eventDate)
        payload.eventDate = dateObj.toISOString()
      }

      // Format eventTime
      if (startTime || endTime) {
        payload.eventTime = endTime ? `${startTime} - ${endTime} WIB` : `${startTime} WIB`
      }

      if (form.venue.trim()) payload.venue = form.venue.trim()
      if (form.address.trim()) payload.address = form.address.trim()
      if (form.templateId) payload.templateId = form.templateId

      return payload
    }

    /**
     * Fungsi submit internal yang mengembalikan boolean berhasil/tidaknya penyimpanan.
     */
    async function submitForm(): Promise<boolean> {
      setGeneralError(null)
      setSuccessMessage(null)

      const nextErrors = validate()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) return false

      try {
        await onSubmit(buildPayload())
        if (isEditMode) {
          setSuccessMessage('Undangan berhasil di edit')
          setPopupState({
            isOpen: true,
            status: 'success',
            title: 'Undangan Berhasil Diubah',
            message: 'Seluruh data dan perubahan informasi undangan telah berhasil disimpan.',
          })
          setTimeout(() => setSuccessMessage(null), 3000)
        }
        return true
      } catch (error) {
        const parsed = parseApiError(error)
        const mapped: FormErrors = {}

        if (parsed.fieldErrors.title) mapped.title = parsed.fieldErrors.title[0]
        if (parsed.fieldErrors.slug) mapped.slug = parsed.fieldErrors.slug[0]
        if (parsed.fieldErrors.eventTime) mapped.eventTime = parsed.fieldErrors.eventTime[0]
        if (parsed.fieldErrors.venue) mapped.venue = parsed.fieldErrors.venue[0]
        if (parsed.fieldErrors.address) mapped.address = parsed.fieldErrors.address[0]

        setErrors(mapped)
        const errorMsg =
          parsed.generalMessage ??
          parsed.allMessages[0] ??
          'Gagal menyimpan perubahan undangan. Silakan periksa kembali formulir atau coba lagi.'
        setGeneralError(errorMsg)

        if (isEditMode) {
          setPopupState({
            isOpen: true,
            status: 'error',
            title: 'Undangan Gagal Diubah',
            message: errorMsg,
          })
        }
        return false
      }
    }

    /**
     * Mengembalikan formulir ke nilai awal.
     */
    function resetForm() {
      if (initialValue) {
        setForm(toFormState(initialValue))
        const [initStart, initEnd] = parseEventTime(initialValue.eventTime)
        setStartTime(initStart)
        setEndTime(initEnd)
      } else {
        setForm(EMPTY_FORM)
        setStartTime('')
        setEndTime('')
      }
      setErrors({})
      setGeneralError(null)
    }

    // Hubungkan metode ke ref eksternal
    useImperativeHandle(ref, () => ({
      submit: submitForm,
      reset: resetForm,
      isDirty,
    }))

    /**
     * Handler submit event dari HTML Form.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      await submitForm()
    }

    // =========================================================================
    // STEP 1: Layar Pemilihan Jenis Undangan (Sebelum Mengisi Formulir)
    // =========================================================================
    if (!selectedCategory && !isEditMode) {
      return (
        <div className="space-y-4 py-2">
          <div className="text-center space-y-1">
            <h3 className="font-display text-base font-bold text-ink">
              Pilih Jenis Undangan Terlebih Dahulu
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Silakan pilih jenis acara yang ingin Anda buat agar formulir dan rincian data
              disesuaikan dengan kebutuhan acara Anda.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            {INVITATION_CATEGORIES.map((cat) => {
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer bg-white shadow-2xs hover:shadow-sm hover:-translate-y-0.5',
                    cat.bgBorderClass,
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-ink group-hover:text-primary transition-colors">
                        {cat.title}
                      </h4>
                      <span className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                        {cat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                    <span>Pilih Jenis Ini</span>
                    <span className="text-sm transition-transform group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {onCancel && (
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Batal
              </Button>
            </div>
          )}
        </div>
      )
    }

    // =========================================================================
    // STEP 2: Formulir Isian Sesuai Jenis Undangan Terpilih
    // =========================================================================
    const activeCatInfo =
      INVITATION_CATEGORIES.find((c) => c.id === currentCategory) ?? INVITATION_CATEGORIES[0]

    return (
      <form id={id} onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Penunjuk Jenis Undangan & Opsi Ganti Jenis */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div>
            <p className="text-xs font-bold text-ink">
              Formulir Undangan {activeCatInfo.title}
            </p>
            <p className="text-[11px] text-muted">
              {currentCategory === 'wedding' && 'Resepsi & Akad Nikah (Kategori: WEDDING)'}
              {currentCategory === 'khitanan' && 'Tasyakuran Walimatul Khitan (Kategori: KHITANAN)'}
              {currentCategory === 'rasulan' && 'Tasyakuran Rasulan / Merti Desa (Kategori: RASULAN)'}
              {currentCategory === 'aqiqah' && 'Tasyakuran Kelahiran Ananda (Kategori: AQIQAH)'}
            </p>
          </div>

          {!isEditMode && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center text-xs font-semibold text-primary hover:text-indigo-700 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Ganti Jenis Undangan</span>
            </button>
          )}

          {isEditMode && (
            <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200/70">
              {INVITATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer',
                    currentCategory === cat.id
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:text-ink',
                  )}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          )}
        </div>

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
            <span>Judul Undangan</span>
          </label>
          <input
            id="inv-title"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={
              currentCategory === 'wedding'
                ? 'Contoh: Pernikahan Hanung & Ratna'
                : currentCategory === 'khitanan'
                ? 'Contoh: Khitanan Muhammad Farel'
                : currentCategory === 'rasulan'
                ? 'Contoh: Rasulan Desa Sukamaju 2026'
                : 'Contoh: Tasyakuran Aqiqah Ananda Rayyan'
            }
            className={cn(fieldClass, errors.title && 'border-red-300 focus:ring-red-200')}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] font-medium text-danger">{errors.title}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="inv-slug" className={labelClass}>
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
            placeholder={
              currentCategory === 'wedding'
                ? 'hanung-ratna'
                : currentCategory === 'khitanan'
                ? 'khitanan-farel'
                : currentCategory === 'rasulan'
                ? 'rasulan-sukamaju-2026'
                : 'aqiqah-rayyan'
            }
            className={cn(fieldClass, errors.slug && 'border-red-300 focus:ring-red-200')}
          />
          <p className="mt-1 text-[11px] text-muted">
            Alamat undangan:{' '}
            <span className="font-semibold text-slate-600">
              /undangan/{form.slug || '...'}
            </span>
          </p>
          {errors.slug && <p className="mt-1 text-[11px] font-medium text-danger">{errors.slug}</p>}
        </div>

        {/* =========================================================================
            SECTION MEMPELAI HANYA UNTUK PERNIKAHAN
        ========================================================================= */}
        {currentCategory === 'wedding' && (
          <>
            {/* Mempelai Pria */}
            <div className={sectionClass}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                <span>Mempelai Pria</span>
              </p>

              <div>
                <label htmlFor="groom-name" className={labelClass}>
                  Nama Lengkap Mempelai Pria
                </label>
                <input
                  id="groom-name"
                  type="text"
                  value={form.groomName}
                  onChange={(e) => updateField('groomName', e.target.value)}
                  placeholder="Hanung Saputra, S.Kom."
                  className={cn(fieldClass, errors.groomName && 'border-red-300')}
                />
                {errors.groomName && (
                  <p className="mt-1 text-[11px] font-medium text-danger">{errors.groomName}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="groom-father" className={labelClass}>
                    Nama Ayah
                  </label>
                  <input
                    id="groom-father"
                    type="text"
                    value={form.groomFather}
                    onChange={(e) => updateField('groomFather', e.target.value)}
                    placeholder="Joko Supriyanto"
                    className={cn(fieldClass, errors.groomFather && 'border-red-300')}
                  />
                  {errors.groomFather && (
                    <p className="mt-1 text-[11px] font-medium text-danger">
                      {errors.groomFather}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="groom-mother" className={labelClass}>
                    Nama Ibu
                  </label>
                  <input
                    id="groom-mother"
                    type="text"
                    value={form.groomMother}
                    onChange={(e) => updateField('groomMother', e.target.value)}
                    placeholder="Sri Rahayu"
                    className={cn(fieldClass, errors.groomMother && 'border-red-300')}
                  />
                  {errors.groomMother && (
                    <p className="mt-1 text-[11px] font-medium text-danger">
                      {errors.groomMother}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mempelai Wanita */}
            <div className={sectionClass}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                <span>Mempelai Wanita</span>
              </p>

              <div>
                <label htmlFor="bride-name" className={labelClass}>
                  Nama Lengkap Mempelai Wanita
                </label>
                <input
                  id="bride-name"
                  type="text"
                  value={form.brideName}
                  onChange={(e) => updateField('brideName', e.target.value)}
                  placeholder="Ratna Dewi, S.Pd."
                  className={cn(fieldClass, errors.brideName && 'border-red-300')}
                />
                {errors.brideName && (
                  <p className="mt-1 text-[11px] font-medium text-danger">{errors.brideName}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="bride-father" className={labelClass}>
                    Nama Ayah
                  </label>
                  <input
                    id="bride-father"
                    type="text"
                    value={form.brideFather}
                    onChange={(e) => updateField('brideFather', e.target.value)}
                    placeholder="Bambang Sutrisno"
                    className={cn(fieldClass, errors.brideFather && 'border-red-300')}
                  />
                  {errors.brideFather && (
                    <p className="mt-1 text-[11px] font-medium text-danger">
                      {errors.brideFather}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="bride-mother" className={labelClass}>
                    Nama Ibu
                  </label>
                  <input
                    id="bride-mother"
                    type="text"
                    value={form.brideMother}
                    onChange={(e) => updateField('brideMother', e.target.value)}
                    placeholder="Siti Aminah"
                    className={cn(fieldClass, errors.brideMother && 'border-red-300')}
                  />
                  {errors.brideMother && (
                    <p className="mt-1 text-[11px] font-medium text-danger">
                      {errors.brideMother}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tanggal & waktu */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-date" className={labelClass}>
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
              <span>Waktu Acara</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(fieldClass, 'mt-0')}
              />
              <span className="text-sm font-medium text-slate-400">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(fieldClass, 'mt-0')}
              />
            </div>
            {errors.eventTime && (
              <p className="mt-1 text-[11px] font-medium text-danger">{errors.eventTime}</p>
            )}
          </div>
        </div>

        {/* Lokasi */}
        <div>
          <label htmlFor="inv-venue" className={labelClass}>
            <span>Nama Lokasi / Gedung / Balai / Kediaman</span>
          </label>
          <input
            id="inv-venue"
            type="text"
            value={form.venue}
            onChange={(e) => updateField('venue', e.target.value)}
            placeholder={
              currentCategory === 'wedding'
                ? 'Gedung Graha Sabha Pramana'
                : currentCategory === 'khitanan'
                ? 'Kediaman Bpk. Ahmad'
                : currentCategory === 'rasulan'
                ? 'Balai Desa Sukamaju'
                : 'Kediaman / Lokasi Acara'
            }
            className={cn(fieldClass, errors.venue && 'border-red-300')}
          />
          {errors.venue && (
            <p className="mt-1 text-[11px] font-medium text-danger">{errors.venue}</p>
          )}
        </div>

        <div>
          <label htmlFor="inv-address" className={labelClass}>
            <span>Alamat Lengkap Acara</span>
          </label>
          <textarea
            id="inv-address"
            rows={3}
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Jl. Melati No. 12, Sleman, Yogyakarta"
            className={cn(fieldClass, 'resize-none', errors.address && 'border-red-300')}
          />
          {errors.address && (
            <p className="mt-1 text-[11px] font-medium text-danger">{errors.address}</p>
          )}
        </div>

        {/* Template */}
        <div>
          <label className={labelClass}>
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
                    'relative flex flex-col items-center overflow-hidden rounded-2xl border-2 p-2 text-left transition-all cursor-pointer',
                    form.templateId === tpl.id
                      ? 'border-primary bg-indigo-50/30'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50',
                    errors.templateId && 'border-red-300',
                  )}
                >
                  <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 relative group">
                    {tpl.previewImageUrl ? (
                      <img
                        src={tpl.previewImageUrl}
                        alt={tpl.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-300">
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-full px-1 text-center">
                    <span className="block truncate text-xs font-bold text-ink" title={tpl.name}>
                      {tpl.name}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block truncate text-[10px]',
                        tpl.isAccessible ? 'text-muted' : 'font-semibold text-amber-600',
                      )}
                    >
                      {tpl.tier === 'FREE' ? 'Gratis' : `Paket ${tpl.tier}`}
                      {!tpl.isAccessible && ' — terkunci'}
                    </span>
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
          {errors.templateId && (
            <p className="mt-1 text-[11px] font-medium text-danger">{errors.templateId}</p>
          )}
        </div>

        {/* Aksi */}
        {!hideSubmitButton && (
          <div className="flex items-center justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                Batal
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Buat Undangan'}
            </Button>
          </div>
        )}

        {/* Modal Pop-up Notifikasi Hasil Edit */}
        <Modal
          isOpen={popupState.isOpen}
          onClose={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
          maxWidth="sm"
          hideCloseButton={false}
        >
          <div className="py-2 text-center space-y-4">
            <AnimatedStatusIcon status={popupState.status} size="md" />

            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                {popupState.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                {popupState.message}
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant={popupState.status === 'success' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => setPopupState((prev) => ({ ...prev, isOpen: false }))}
              >
                {popupState.status === 'success' ? 'Selesai' : 'Tutup'}
              </Button>
            </div>
          </div>
        </Modal>
      </form>
    )
  },
)