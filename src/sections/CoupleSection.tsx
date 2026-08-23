import { motion } from 'framer-motion'

export type CoupleSectionProps = {
  groomFullName?: string
  groomNickname?: string
  groomParents?: string
  groomInstagram?: string
  brideFullName?: string
  brideNickname?: string
  brideParents?: string
  brideInstagram?: string
}

/**
 * Komponen Profil Kedua Mempelai Pengantin.
 * Menampilkan foto, nama lengkap, putra/putri dari orang tua, dan tautan sosial media Instagram.
 * 
 * @param props - Properti CoupleSection
 */
export function CoupleSection({
  groomFullName = 'Hanung Saputra, S.Kom',
  groomNickname = 'Han',
  groomParents = 'Putra pertama dari Bpk. Bambang Supriyadi & Ibu Sri Wahyuni',
  groomInstagram = 'hansaputra',
  brideFullName = 'dr. Ratna Anindya Permata',
  brideNickname = 'Ratna',
  brideParents = 'Putri kedua dari Bpk. Ir. H. Joko Santoso & Ibu Hj. Nurhayati',
  brideInstagram = 'ratna.anindya',
}: CoupleSectionProps) {
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
                  alt={groomFullName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">{groomFullName}</h3>
              <p className="text-sm font-semibold text-sage mt-0.5">({groomNickname})</p>
              <p className="mt-2 text-xs text-slate-600 max-w-xs leading-relaxed">{groomParents}</p>

              <a
                href={`https://instagram.com/${groomInstagram}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-sage hover:text-white transition"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@{groomInstagram}</span>
              </a>
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
                  alt={brideFullName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">{brideFullName}</h3>
              <p className="text-sm font-semibold text-gold mt-0.5">({brideNickname})</p>
              <p className="mt-2 text-xs text-slate-600 max-w-xs leading-relaxed">{brideParents}</p>

              <a
                href={`https://instagram.com/${brideInstagram}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-gold hover:text-white transition"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@{brideInstagram}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
