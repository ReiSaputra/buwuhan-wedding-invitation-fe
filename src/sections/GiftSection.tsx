import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Copy, Check, CreditCard } from 'lucide-react'

const BANK_ACCOUNTS = [
  {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8820192831',
    accountHolder: 'Hanung Saputra',
    type: 'Pria',
  },
  {
    bankName: 'Bank Mandiri',
    accountNumber: '1370019283112',
    accountHolder: 'Ratna Anindya Permata',
    type: 'Wanita',
  },
]

/**
 * Komponen Amplop Digital & Tanda Kasih (Gift Section).
 * Menyediakan informasi rekening bank, QRIS, dan alamat pengiriman kado fisik
 * dengan tombol salin nomor rekening instan.
 */
export function GiftSection() {
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const giftAddress = 'Jl. Senayan Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190'

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
    <section id="hadiah" className="py-20 px-6 bg-[#faf7f2] relative overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#526b5d]">
            Wedding Gift &amp; Buwuh
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Tanda Kasih &amp; Amplop Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat menggunakan fitur di bawah ini:
          </p>
        </div>

        {/* Rekening Bank Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {BANK_ACCOUNTS.map((acc) => {
            const isCopied = copiedBank === acc.accountNumber

            return (
              <motion.div
                key={acc.accountNumber}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-[#c59b27]/30 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-[#c59b27]" />
                    <span className="font-bold text-xs text-slate-900">{acc.bankName}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526b5d] bg-[#526b5d]/10 px-2.5 py-0.5 rounded-full">
                    {acc.type}
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-[11px] text-slate-400">Nomor Rekening:</span>
                  <p className="font-display text-2xl font-bold tracking-wider text-slate-900">
                    {acc.accountNumber}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">a.n. {acc.accountHolder}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAccount(acc.accountNumber, acc.accountNumber)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#526b5d] text-white hover:bg-[#3c5044]'
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
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c59b27]/15 text-[#c59b27]">
            <Gift size={24} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Kirim Kado / Hadiah Fisik</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Bagi yang berkenan mengirimkan kado bingkisan secara langsung, dapat dialamatkan ke:
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {giftAddress}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            {copiedAddress ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedAddress ? 'Alamat Tersalin!' : 'Salin Alamat Lengkap'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
