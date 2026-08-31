import { motion } from 'framer-motion'
import type { ApiCouple } from '@/types/invitation-api'

export type CoupleSectionProps = {
  /** Data mempelai pria dari backend, null bila belum tersedia */
  groom: ApiCouple | null
  /** Data mempelai wanita dari backend, null bila belum tersedia */
  bride: ApiCouple | null
}

/**
 * Menyusun teks orang tua mempelai dari nama ayah dan ibu.
 *
 * @param couple - Data mempelai dari backend
 * @param childLabel - 'Putra' untuk mempelai pria, 'Putri' untuk wanita
 * @returns Teks orang tua, atau string kosong bila data belum diisi
 */
function buildParentsText(couple: ApiCouple | null, childLabel: string): string {
  if (!couple) return ''

  const parents = [couple.fatherName, couple.motherName].filter(Boolean)
  if (parents.length === 0) return ''

  return `${childLabel} dari ${parents.join(' & ')}`
}

/**
 * Mengambil nama panggilan dari kata pertama nama lengkap.
 *
 * @param fullName - Nama lengkap mempelai
 * @returns Kata pertama nama, atau string kosong
 */
function buildNickname(fullName: string | undefined): string {
  return fullName?.trim().split(' ')[0] ?? ''
}

/**
 * Komponen Profil Kedua Mempelai Pengantin.
 * Menampilkan foto, nama lengkap, dan nama orang tua kedua mempelai
 * berdasarkan data asli dari backend.
 *
 * @param props - Properti CoupleSection (groom, bride)
 */
export function CoupleSection({ groom, bride }: CoupleSectionProps) {
  const groomParents = buildParentsText(groom, 'Putra')
  const brideParents = buildParentsText(bride, 'Putri')

  return (
    <section id="mempelai" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-sage">
            Pasangan Mempelai
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            Maha Suci Allah yang Mempersatukan Kami
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2 items-center">
          {/* Mempelai Pria */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-sage to-gold shadow-xl">
              <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60"
                  alt={groom?.name ?? 'Mempelai Pria'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                {groom?.name ?? '—'}
              </h3>
              {buildNickname(groom?.name) && (
                <p className="text-sm font-semibold text-sage mt-0.5">
                  ({buildNickname(groom?.name)})
                </p>
              )}
              {groomParents && (
                <p className="mt-2 text-xs text-slate-600 max-w-xs leading-relaxed">
                  {groomParents}
                </p>
              )}
            </div>
          </motion.div>

          {/* Mempelai Wanita */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-gold to-rose-gold shadow-xl">
              <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60"
                  alt={bride?.name ?? 'Mempelai Wanita'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                {bride?.name ?? '—'}
              </h3>
              {buildNickname(bride?.name) && (
                <p className="text-sm font-semibold text-gold mt-0.5">
                  ({buildNickname(bride?.name)})
                </p>
              )}
              {brideParents && (
                <p className="mt-2 text-xs text-slate-600 max-w-xs leading-relaxed">
                  {brideParents}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}