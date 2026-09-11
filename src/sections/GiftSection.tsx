import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Copy, Check, CreditCard, QrCode, Maximize2, X, Download } from 'lucide-react'
import { usePublicGiftAccounts } from '@/hooks/useGiftAccounts'
import type { GiftAccount, PublicGiftAccount } from '@/types/panel'

export interface GiftSectionProps {
  slug?: string
  initialAccounts?: (GiftAccount | PublicGiftAccount)[]
  initialGiftAddress?: string | null
}

/**
 * Komponen Amplop Digital & Tanda Kasih (Gift Section).
 * Menyediakan informasi rekening bank, QRIS (dengan fitur perbesar layar penuh),
 * dan alamat pengiriman kado fisik dengan tombol salin nomor rekening instan.
 */
export function GiftSection({
  slug = '',
  initialAccounts,
  initialGiftAddress,
}: GiftSectionProps) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [selectedQris, setSelectedQris] = useState<{ url: string; title: string } | null>(null)

  const { accounts: fetchedAccounts, isLoading } = usePublicGiftAccounts(slug)

  // Prioritaskan akun dari initial/server-rendered props, fallback ke query publik
  const accounts =
    initialAccounts && initialAccounts.length > 0
      ? initialAccounts
      : fetchedAccounts

  const giftAddress = initialGiftAddress ?? null

  // Sembunyikan section bila tidak ada data amplop maupun alamat kado (setelah selesai loading)
  if (!isLoading && accounts.length === 0 && !giftAddress) return null

  /**
   * Menyalin nomor rekening bank ke clipboard.
   */
  async function handleCopyAccount(accountNumber: string, key: string) {
    await navigator.clipboard.writeText(accountNumber)
    setCopiedBank(key)
    setTimeout(() => setCopiedBank(null), 2000)
  }

  /**
   * Menyalin alamat kado fisik ke clipboard.
   */
  async function handleCopyAddress() {
    if (!giftAddress) return
    await navigator.clipboard.writeText(giftAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <section id="hadiah" className="py-20 px-6 bg-inv-page relative overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-accent">
            Wedding Gift &amp; Buwuh
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-inv-ink">
            Tanda Kasih &amp; Amplop Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat menggunakan fitur di bawah ini:
          </p>
        </div>

        {/* Rekening Bank Cards */}
        {accounts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {accounts.map((acc) => {
              const isCopied = copiedBank === acc.accountNumber
              // Deteksi semua alias field untuk QRIS
              const qrisImage: string | null =
                acc.qrCodeUrl ||
                ((acc as Record<string, unknown>).qrCode as string) ||
                ((acc as Record<string, unknown>).qr_code_url as string) ||
                ((acc as Record<string, unknown>).imageUrl as string) ||
                ((acc as Record<string, unknown>).qrisUrl as string) ||
                null

              return (
                <motion.div
                  key={acc.id || acc.accountNumber}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="rounded-3xl border border-inv-gold/30 bg-inv-card p-6 shadow-xs flex flex-col justify-between space-y-5 relative overflow-hidden transform-gpu"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-inv-gold" />
                      <span className="font-bold text-xs text-inv-ink">{acc.bankName}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-inv-accent bg-inv-accent/10 px-2.5 py-0.5 rounded-full">
                      {acc.type}
                    </span>
                  </div>

                  <div className="py-1">
                    <span className="text-[11px] text-inv-ink-muted">Nomor Rekening:</span>
                    <p className="font-display text-2xl font-bold tracking-wider text-inv-ink font-mono">
                      {acc.accountNumber}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">a.n. {acc.accountHolder}</p>
                  </div>

                  {/* Tampilan Gambar QRIS */}
                  {qrisImage && typeof qrisImage === 'string' && (
                    <div className="rounded-2xl border border-inv-line bg-white p-3 text-center space-y-2">
                      <div className="relative group mx-auto w-fit">
                        <img
                          src={qrisImage}
                          alt={`QRIS ${acc.bankName}`}
                          className="h-44 w-44 rounded-xl object-contain mx-auto border border-slate-100 bg-white p-1 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedQris({ url: qrisImage, title: `QRIS ${acc.bankName} - a.n. ${acc.accountHolder}` })}
                          className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-[2px]"
                          title="Perbesar QRIS"
                        >
                          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold">
                            <Maximize2 size={13} />
                            <span>Perbesar</span>
                          </div>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
                        <QrCode size={13} className="text-inv-accent" />
                        <span>Scan Kode QRIS di atas</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(acc.accountNumber, acc.accountNumber)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-600 text-inv-on-accent'
                        : 'bg-inv-accent text-inv-on-accent hover:bg-inv-accent-dark'
                    }`}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Nomor Rekening Tersalin!' : 'Salin Nomor Rekening'}</span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Kirim Kado Fisik Box */}
        {giftAddress && (
          <div className="rounded-3xl border border-inv-line bg-inv-card p-6 sm:p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-inv-gold/15 text-inv-gold">
              <Gift size={24} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-inv-ink">Kirim Kado / Hadiah Fisik</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Bagi yang berkenan mengirimkan kado bingkisan secara langsung, dapat dialamatkan ke:
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-800 bg-inv-page-alt p-3 rounded-xl border border-inv-line">
                {giftAddress}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-2 rounded-xl border border-inv-line bg-inv-card px-4 py-2 text-xs font-bold text-inv-ink hover:bg-inv-page-alt transition cursor-pointer"
            >
              {copiedAddress ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedAddress ? 'Alamat Tersalin!' : 'Salin Alamat Lengkap'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal / Lightbox Perbesar QRIS */}
      <AnimatePresence>
        {selectedQris && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-sm w-full rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4"
            >
              <button
                type="button"
                onClick={() => setSelectedQris(null)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-ink">{selectedQris.title}</h3>
                <p className="text-[11px] text-slate-500">
                  Arahkan kamera e-wallet / mobile banking Anda ke QR code di bawah
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <img
                  src={selectedQris.url}
                  alt="QRIS Full"
                  className="mx-auto max-h-72 w-full object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <a
                  href={selectedQris.url}
                  download="qris-pernikahan.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  <span>Buka / Unduh Gambar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedQris(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
