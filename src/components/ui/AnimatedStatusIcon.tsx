import { motion } from 'framer-motion'

export type AnimatedStatusIconProps = {
  /** Status ikon: success (ceklis hijau), error (silang merah), atau delete/warning (tempat sampah bergetar) */
  status: 'success' | 'error' | 'delete' | 'warning'
  /** Ukuran ikon (default: md) */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Komponen ikon status interaktif teroptimasi 60/120fps GPU-accelerated.
 * Menggunakan bezier drawing presisi, hardware composition, dan spring physics
 * yang ringan tanpa infinite main-thread animation loops.
 */
export function AnimatedStatusIcon({ status, size = 'md' }: AnimatedStatusIconProps) {
  const containerSizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  if (status === 'success') {
    return (
      <div className={`relative mx-auto flex ${containerSizes[size]} items-center justify-center`}>
        {/* Efek gelombang ripple latar belakang satu kali (GPU Composited) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full bg-emerald-400/25 pointer-events-none transform-gpu"
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Wadah utama ikon dengan animasi spring presisi */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 26,
            mass: 0.7,
          }}
          style={{ willChange: 'transform, opacity' }}
          className={`relative flex ${containerSizes[size]} items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-sm transform-gpu`}
        >
          <svg
            className={`${iconSizes[size]} text-emerald-600`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Animasi goresan garis ceklis GPU Bezier */}
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                delay: 0.12,
                duration: 0.38,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </svg>
        </motion.div>
      </div>
    )
  }

  if (status === 'delete' || status === 'warning') {
    return (
      <div className={`relative mx-auto flex ${containerSizes[size]} items-center justify-center`}>
        {/* Efek gelombang ripple latar belakang peringatan */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full bg-rose-400/25 pointer-events-none transform-gpu"
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Wadah utama dengan animasi spring dan goyangan halus */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [0, -7, 7, -4, 4, 0],
          }}
          transition={{
            scale: { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 },
            opacity: { duration: 0.2 },
            rotate: { delay: 0.15, duration: 0.42, ease: 'easeOut' },
          }}
          style={{ willChange: 'transform, opacity' }}
          className={`relative flex ${containerSizes[size]} items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/90 shadow-sm transform-gpu`}
        >
          <svg
            className={`${iconSizes[size]} text-rose-600`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Bentuk badan tempat sampah */}
            <motion.path
              d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.35, ease: 'easeOut' }}
            />
            {/* Garis vertikal tempat sampah */}
            <motion.line
              x1="10"
              y1="11"
              x2="10"
              y2="17"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.25, ease: 'easeOut' }}
            />
            <motion.line
              x1="14"
              y1="11"
              x2="14"
              y2="17"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.25, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`relative mx-auto flex ${containerSizes[size]} items-center justify-center`}>
      {/* Efek gelombang ripple latar belakang untuk error */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: 1.35, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 rounded-full bg-rose-400/25 pointer-events-none transform-gpu"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Wadah utama error dengan animasi getar (shake) halus */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: [0, -6, 6, -3, 3, 0],
        }}
        transition={{
          scale: { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 },
          opacity: { duration: 0.2 },
          x: { delay: 0.15, duration: 0.35, ease: 'easeOut' },
        }}
        style={{ willChange: 'transform, opacity' }}
        className={`relative flex ${containerSizes[size]} items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/90 shadow-sm transform-gpu`}
      >
        <svg
          className={`${iconSizes[size]} text-rose-600`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Garis silang diagonal 1 */}
          <motion.path
            d="M6 18L18 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.25,
              ease: 'easeOut',
            }}
          />
          {/* Garis silang diagonal 2 */}
          <motion.path
            d="M6 6l12 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.25,
              ease: 'easeOut',
            }}
          />
        </svg>
      </motion.div>
    </div>
  )
}
