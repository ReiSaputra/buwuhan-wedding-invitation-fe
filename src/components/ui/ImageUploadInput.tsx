import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  QrCode,
} from 'lucide-react'
import { api } from '@/lib/api'

export interface ImageUploadInputProps {
  label: string
  value: string
  onChange: (url: string) => void
  helperText?: string
  isQris?: boolean
  maxSizeMb?: number
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

/**
 * Komponen Unggah Berkas Gambar (PNG, JPG, WebP) dengan Pratinjau Instan,
 * Peringatan Penolakan PDF yang Edukatif, dan Dukungan URL Alternatif.
 */
export function ImageUploadInput({
  label,
  value,
  onChange,
  helperText,
  isQris = false,
  maxSizeMb = 5,
}: ImageUploadInputProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function validateAndProcessFile(file: File) {
    setErrorMessage(null)

    // Deteksi khusus jika pengguna mengunggah file PDF
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(
        'Format PDF tidak didukung untuk QRIS web. Silakan buka file PDF Anda, lakukan screenshot pada bagian kode QRIS, lalu unggah gambar (PNG / JPG / WebP) tersebut.',
      )
      return
    }

    // Validasi tipe mime gambar
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage('Hanya format gambar PNG, JPG, JPEG, atau WebP yang diperbolehkan.')
      return
    }

    // Validasi ukuran berkas
    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorMessage(`Ukuran berkas terlalu besar. Maksimal ${maxSizeMb} MB.`)
      return
    }

    setFileName(file.name)
    setIsUploading(true)

    // 1. Buat pratinjau instan lokal dengan FileReader
    const reader = new FileReader()
    reader.onload = async (e) => {
      const localDataUrl = e.target?.result as string
      onChange(localDataUrl)

      // 2. Unggah ke backend jika endpoint tersedia
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', isQris ? 'qris' : 'images')

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
      } catch (uploadErr) {
        // Jika backend endpoint upload belum siap, tetap pertahankan local preview
        console.info('Endpoint upload backend belum tersedia/gagal, menggunakan data gambar lokal.', uploadErr)
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

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndProcessFile(file)
    }
  }

  function handleClearImage() {
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
          {isQris ? <QrCode size={13} className="text-primary" /> : <ImageIcon size={13} className="text-primary" />}
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
            URL Gambar
          </button>
        </div>
      </div>

      {/* Input Mode: URL Manual */}
      {mode === 'url' && (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              setErrorMessage(null)
              onChange(e.target.value)
            }}
            placeholder="https://.../gambar-qris.png"
            className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs pr-8"
          />
          {value && (
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Input Mode: Upload Berkas Drag & Drop */}
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-primary bg-indigo-50/50 text-primary'
                  : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/60 text-slate-500'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs text-primary border border-slate-100">
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <UploadCloud size={18} />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">
                  Klik untuk unggah atau seret gambar ke sini
                </p>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, WebP (Maks. {maxSizeMb} MB). <strong className="text-slate-600">Bukan PDF</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center p-1">
                <img
                  src={value}
                  alt="Pratinjau"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="truncate">{fileName || (isQris ? 'Gambar QRIS Terpilih' : 'Gambar Terpilih')}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Gambar siap ditampilkan pada section undangan
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
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

      {/* Pesan Error / Edukasi Penolakan PDF */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-[11px] text-rose-700 animate-in fade-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Petunjuk Tambahan */}
      {helperText && !errorMessage && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  )
}
