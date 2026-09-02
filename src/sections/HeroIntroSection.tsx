import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export type HeroIntroSectionProps = {
  groomName: string
  brideName: string
  eventDateStr: string
}

/**
 * Komponen Hero & Ayat Suci Pembuka Undangan.
 * Menampilkan kutipan ayat suci Ar-Rum: 21, salam pembuka islami/universal,
 * serta foto pengantin dengan ornamen elegan dan animasi GPU-accelerated.
 * 
 * @param props - Properti HeroIntroSection
 */
export function HeroIntroSection({ groomName, brideName, eventDateStr }: HeroIntroSectionProps) {
  return (
    <section id="salam" className="relative py-20 px-6 text-center bg-inv-page overflow-hidden">
      {/* Background patterns */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-inv-gold/10 blur-3xl" />

      <div className="mx-auto max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-3 transform-gpu"
        >
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-inv-accent">
            Assalamu’alaikum Warahmatullahi Wabarakatuh
          </span>
          <p className="font-serif text-sm sm:text-base text-inv-ink italic leading-relaxed pt-2">
            Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami bermaksud mengundang Bapak/Ibu/Saudara/i sekalian untuk menghadiri dan memberikan doa restu pada acara pernikahan kami:
          </p>
        </motion.div>

        {/* Frame Foto Pasangan / Ornamen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="relative mx-auto max-w-sm rounded-3xl overflow-hidden p-2 bg-gradient-to-b from-gold/40 via-white to-sage/30 shadow-xl transform-gpu"
        >
          <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] relative">
            <img
              src="/images/rings.jpg"
              alt="Cincin Pernikahan"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-6 text-inv-on-accent text-center">
              <div>
                <p className="font-display text-2xl font-bold">{groomName} &amp; {brideName}</p>
                <p className="text-xs text-inv-on-accent/80 uppercase tracking-widest mt-0.5">{eventDateStr}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ayat Suci Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="rounded-3xl border border-inv-gold/25 bg-inv-card/80 p-6 sm:p-8 shadow-xs text-center relative transform-gpu"
        >
          <Quote size={28} className="mx-auto text-inv-gold/40 mb-3" />
          <p className="font-serif text-sm sm:text-base leading-relaxed text-inv-ink italic">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
          </p>
          <p className="mt-3 text-xs font-bold text-inv-accent uppercase tracking-wider">
            — QS. Ar-Rum: 21 —
          </p>
        </motion.div>
      </div>
    </section>
  )
}
