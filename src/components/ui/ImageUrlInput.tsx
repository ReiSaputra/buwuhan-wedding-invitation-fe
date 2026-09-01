import { useState } from 'react'
import { ImageOff, Link2, UploadCloud } from 'lucide-react'

export type ImageUrlInputProps = {
  /** Label ruas formulir */
  label: string
  /** Nilai URL gambar saat ini */
  value: string
  /** Callback saat URL berubah */
  onChange: (value: string) => void
  /** Pesan galat validasi dari formulir induk */
  error?: string
}

const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-2xs'

/**
 * Komponen input URL gambar dengan pratinjau langsung.
 *
 * Sementara backend belum menyediakan endpoint unggah berkas, pengguna
 * memasukkan URL gambar (misal dari Cloudinary atau Google Drive publik).
 * Setelah endpoint unggah tersedia, cukup ganti bagian bertanda TODO di
 * bawah dengan pemanggilan API unggah; antarmuka komponen tidak perlu berubah.
 */
export function ImageUrlInput({ label, value, onChange, error }: ImageUrlInputProps) {
  const [isBroken, setIsBroken] = useState(false)

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
        <Link2 size={13} className="text-primary" />
        <span>{label}</span>
      </label>

      <input
        type="url"
        value={value}
        onChange={(event) => {
          setIsBroken(false)
          onChange(event.target.value)
        }}
        placeholder="https://res.cloudinary.com/…/foto-prewedding.jpg"
        className={fieldClass}
      />

      {error && <p className="mt-1 text-[11px] font-medium text-danger">{error}</p>}

      {/* Pratinjau supaya pengguna tahu tautannya benar sebelum menyimpan */}
      <div className="mt-2 flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        {value && !isBroken ? (
          <img
            src={value}
            alt="Pratinjau gambar"
            className="h-full w-full object-cover"
            onError={() => setIsBroken(true)}
          />
        ) : (
          <div className="space-y-1 text-center">
            {isBroken ? (
              <ImageOff size={20} className="mx-auto text-slate-300" />
            ) : (
              <UploadCloud size={20} className="mx-auto text-slate-300" />
            )}
            <p className="text-[11px] text-slate-400">
              {isBroken ? 'Gambar gagal dimuat' : 'Pratinjau gambar akan muncul di sini'}
            </p>
          </div>
        )}
      </div>

      {/* TODO(backend): ganti input URL di atas dengan unggah berkas setelah
          endpoint POST /uploads tersedia di backend. */}
    </div>
  )
}