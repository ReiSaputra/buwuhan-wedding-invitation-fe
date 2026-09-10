import { useState, useRef, type ChangeEvent } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'

export type ImageUrlInputProps = {
  /** Label ruas formulir */
  label: string
  /** Nilai URL gambar saat ini */
  value: string
  /** Callback saat URL berubah */
  onChange: (value: string) => void
  /** Pesan galat validasi dari formulir induk */
  error?: string
  /** Teks petunjuk (placeholder) pada input */
  placeholder?: string
  /** Kategori folder penyimpanan berkas di server */
  folder?: 'images' | 'qris' | 'gallery' | string
  /** Batas maksimal ukuran berkas dalam MB */
  maxSizeMb?: number
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

/**
 * Komponen Input Gambar Universal (Upload File Drag & Drop + URL Eksternal).
 * Dilengkapi validasi format PNG/JPG/WebP, pratinjau instan lokal, dan
 * pengiriman otomatis ke endpoint upload backend.
 */
export function ImageUrlInput({
  label,
  value,
  onChange,
  error,
  placeholder = 'https://res.cloudinary.com/…/foto.jpg',
  folder = 'images',
  maxSizeMb = 5,
}: ImageUrlInputProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function validateAndProcessFile(file: File) {
    setErrorMessage(null)

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Format PDF tidak didukung. Mohon gunakan file gambar (PNG, JPG, atau WebP).')
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage('Hanya format gambar PNG, JPG, JPEG, atau WebP yang diperbolehkan.')
      return
    }

    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorMessage(`Ukuran berkas melebihi batas maksimal ${maxSizeMb} MB.`)
      return
    }

    setFileName(file.name)
    setIsUploading(true)

    // 1. Instant local preview dengan FileReader
    const reader = new FileReader()
    reader.onload = async (e) => {
      const localDataUrl = e.target?.result as string
      onChange(localDataUrl)

      // 2. Dispatch upload ke backend API
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const res = await api.post<{ data: { url: string; fileUrl?: string } }>(
          '/uploads/images',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )

        const uploadedUrl = res.data?.data?.url || res.data?.data?.fileUrl
        if (uploadedUrl) {
          onChange(uploadedUrl)
        }
      } catch (uploadErr: unknown) {
        console.error('Upload gambar gagal:', uploadErr)
        onChange('')
        setFileName(null)
        const apiMsg = (uploadErr as { response?: { data?: { message?: string } } })?.response?.data?.message
        setErrorMessage(
          apiMsg || 'Gambar gagal diunggah ke server. Pastikan format PNG/JPG/WebP dan ukuran maks. 5 MB.',
        )
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      validateAndProcessFile(file)
    }
  }

  function handleClear() {
    onChange('')
    setFileName(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {/* Header Label & Mode Selector */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <ImageIcon size={13} className="text-primary" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`rounded-md px-2 py-0.5 transition cursor-pointer ${
              mode === 'upload' ? 'bg-white text-primary shadow-xs' : 'hover:text-ink'
            }`}
          >
            Upload Berkas
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded-md px-2 py-0.5 transition cursor-pointer ${
              mode === 'url' ? 'bg-white text-primary shadow-xs' : 'hover:text-ink'
            }`}
          >
            URL Tautan
          </button>
        </div>
      </div>

      {/* Mode: Input URL Manual */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                setErrorMessage(null)
                onChange(e.target.value)
              }}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {value && (
            <div className="h-32 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
              <img
                src={value}
                alt="Pratinjau URL"
                className="h-full w-full object-cover rounded-xl"
                onError={() => setErrorMessage('Gambar dari URL ini tidak dapat dimuat.')}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode: Upload Berkas Drag & Drop */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!value ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) validateAndProcessFile(file)
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-primary bg-indigo-50/50 text-primary'
                  : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/60 text-slate-500'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs text-primary border border-slate-100">
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">
                  Klik untuk pilih file atau seret gambar ke sini
                </p>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, WebP (Maks. {maxSizeMb} MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center p-0.5">
                <img
                  src={value}
                  alt="Pratinjau"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="truncate">{fileName || 'Gambar Terpilih'}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Gambar siap digunakan pada undangan
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  <span>Ganti</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Hapus Gambar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pesan Galat */}
      {(errorMessage || error) && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2 text-[11px] text-rose-700 animate-in fade-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{errorMessage || error}</p>
        </div>
      )}
    </div>
  )
}