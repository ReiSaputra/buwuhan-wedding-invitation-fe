import { useMemo, useState } from 'react'
import { AlertTriangle, FileUp, Upload } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { GUEST_IMPORT_EXAMPLE, MAX_BULK_GUESTS, parseGuestText } from '@/lib/guestImport'
import type { GuestPayload } from '@/types/invitation-api'

type Props = {
  isOpen: boolean
  onClose: () => void
  isSubmitting?: boolean
  onSubmit: (guests: GuestPayload[]) => void
}

/**
 * Modal import tamu massal. Menerima teks tempel atau berkas .csv/.txt,
 * memvalidasi tiap baris di sisi klien, lalu mengirimnya ke endpoint bulk.
 */
export function ImportGuestsModal({ isOpen, onClose, isSubmitting = false, onSubmit }: Props) {
  const [text, setText] = useState('')

  const rows = useMemo(() => parseGuestText(text), [text])
  const validRows = rows.filter((r) => r.payload)
  const errorRows = rows.filter((r) => r.error)
  const isOverLimit = validRows.length > MAX_BULK_GUESTS

  async function handleFile(file: File | undefined) {
    if (!file) return
    setText(await file.text())
  }

  function handleSubmit() {
    if (validRows.length === 0 || isOverLimit) return
    onSubmit(validRows.map((r) => r.payload as GuestPayload))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Tamu Massal"
      description={`Tempel daftar tamu atau unggah berkas CSV. Maksimal ${MAX_BULK_GUESTS} tamu per import.`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary">
          <FileUp size={14} />
          Pilih berkas .csv atau .txt
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={GUEST_IMPORT_EXAMPLE}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 font-mono text-[11px] leading-relaxed text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />

        <p className="text-[11px] text-slate-400">
          Urutan kolom: <strong>Nama, Kategori, Nomor HP, Email, Pax, Keterangan</strong>. Hanya
          kolom Nama yang wajib. Baris header otomatis dilewati.
        </p>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-[11px] font-semibold">
          <span className="text-emerald-600">{validRows.length} baris siap diimport</span>
          {errorRows.length > 0 && (
            <span className="text-danger">{errorRows.length} baris bermasalah</span>
          )}
        </div>

        {(errorRows.length > 0 || isOverLimit) && (
          <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
            {isOverLimit && (
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                <AlertTriangle size={12} /> Melebihi batas {MAX_BULK_GUESTS} tamu. Pecah menjadi
                beberapa kali import.
              </p>
            )}
            {errorRows.map((row) => (
              <p key={row.line} className="text-[11px] text-amber-700">
                Baris {row.line}: {row.error}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={handleSubmit}
            disabled={isSubmitting || validRows.length === 0 || isOverLimit}
          >
            {isSubmitting ? 'Mengimport…' : `Import ${validRows.length} Tamu`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}