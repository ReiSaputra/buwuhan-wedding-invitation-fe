import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Copy, Check, CreditCard } from 'lucide-react'

import { GIFT_ACCOUNTS, GIFT_ADDRESS } from '@/config/gift-accounts'

/**
 * Komponen Amplop Digital & Tanda Kasih (Gift Section).
 * Menyediakan informasi rekening bank, QRIS, dan alamat pengiriman kado fisik
 * dengan tombol salin nomor rekening instan.
 */
export function GiftSection() {
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const giftAddress = GIFT_ADDRESS
  // Sembunyikan section bila tidak ada data amplop maupun alamat kado
  if (GIFT_ACCOUNTS.length === 0 && !giftAddress) return null
  /**
   * Menyalin nomor rekening bank ke clipboard.
   * 
   * @param accountNumber - Nomor rekening
   * @param key - Identifier bank
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
        <div className="grid gap-6 sm:grid-cols-2">
          {GIFT_ACCOUNTS.map((acc) => {
            const isCopied = copiedBank === acc.accountNumber

            return (
              <motion.div
                key={acc.accountNumber}
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
                  <p className="font-display text-2xl font-bold tracking-wider text-inv-ink">
                    {acc.accountNumber}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">a.n. {acc.accountHolder}</p>
                </div>

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

        {/* Kirim Kado Fisik Box */}
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
      </div>
    </section>
  )
}
