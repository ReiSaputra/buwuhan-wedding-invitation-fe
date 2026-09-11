import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, X } from 'lucide-react'
import { getStorySectionTitle, getStorySectionSubtitle } from '@/lib/storyHelper'
import type { ApiGalleryPhoto, ApiLoveStory, ApiEventCategory } from '@/types/invitation-api'

export type LoveStoryGallerySectionProps = {
  /** Daftar kisah/cerita dari backend, urut berdasarkan kolom order */
  loveStories: ApiLoveStory[]
  /** Daftar foto galeri dari backend, urut berdasarkan kolom order */
  galleryPhotos: ApiGalleryPhoto[]
  /** Kategori acara untuk menyesuaikan judul linimasa (Wedding, Khitanan, Aqiqah, Rasulan) */
  eventCategory?: ApiEventCategory | string | null
}

/**
 * Komponen Galeri Foto & Cerita Linimasa Perjalanan (Story Timeline).
 * Menampilkan kisah perjalanan dan galeri kenangan berdasarkan data asli undangan,
 * disesuaikan secara otomatis berdasarkan kategori acara (Wedding, Khitanan, Aqiqah, dll).
 *
 * @param props - Properti LoveStoryGallerySection (loveStories, galleryPhotos, eventCategory)
 */
export function LoveStoryGallerySection({
  loveStories,
  galleryPhotos,
  eventCategory,
}: LoveStoryGallerySectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Urutkan berdasarkan kolom order agar tampil sesuai pengaturan pengguna
  const sortedStories = [...loveStories].sort((a, b) => a.order - b.order)
  const sortedPhotos = [...galleryPhotos].sort((a, b) => a.order - b.order)

  const hasStories = sortedStories.length > 0
  const hasPhotos = sortedPhotos.length > 0

  // Bila kedua data kosong, section ini tidak perlu dirender sama sekali
  if (!hasStories && !hasPhotos) return null

  return (
    <section id="galeri" className="py-20 px-6 bg-inv-card relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Linimasa Cerita / Momen */}
        {hasStories && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-accent">
                {getStorySectionSubtitle(eventCategory)}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-inv-ink">
                {getStorySectionTitle(eventCategory)}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {sortedStories.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
                  className="rounded-3xl border border-inv-line bg-inv-page p-6 text-center space-y-3 relative shadow-2xs transform-gpu"
                >
                  {item.imageUrl && (
                    <div className="h-32 w-full overflow-hidden rounded-2xl">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <span className="inline-flex items-center justify-center rounded-full bg-inv-accent px-3 py-1.5 text-inv-on-accent font-bold text-xs shadow-xs">
                    {item.yearOrDate}
                  </span>
                  <h4 className="font-display text-base font-bold text-inv-ink">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.story}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Galeri Foto */}
        {hasPhotos && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-inv-gold">
                Galeri Kenangan
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-inv-ink">
                Momen-momen Indah
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sortedPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                  onClick={() => setSelectedPhoto(photo.imageUrl)}
                  className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-inv-line transform-gpu"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption ?? 'Foto kenangan'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-inv-on-accent px-2 text-center">
                    <ImageIcon size={24} />
                    {photo.caption && (
                      <span className="text-[11px] font-semibold leading-snug">
                        {photo.caption}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 transform-gpu backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-inv-on-accent hover:bg-black transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <img
              src={selectedPhoto}
              alt=""
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  )
}