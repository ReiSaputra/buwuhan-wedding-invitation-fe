import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, X } from 'lucide-react'

const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60', caption: 'Momen Prewedding di Bromo' },
  { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=60', caption: 'Lamaran & Pertunangan' },
  { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=60', caption: 'Tawa & Bahagia Bersama' },
  { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=60', caption: 'Langkah Menuju Masa Depan' },
]

const STORIES = [
  { year: '2022', title: 'Pertama Kali Bertemu', desc: 'Pertemuan pertama di sebuah seminar teknologi di Jakarta yang membuka jalan percakapan berharga.' },
  { year: '2024', title: 'Komitmen Menjalin Hubungan', desc: 'Setelah saling mengenal kepribadian masing-masing, kami memantapkan hati melangkah bersama.' },
  { year: '2025', title: 'Lamaran Resmi Keluarga', desc: 'Pertemuan dua keluarga besar untuk mengikat janji suci menuju pelaminan.' },
]

/**
 * Komponen Galeri Foto Prewedding & Cerita Cinta (Love Story).
 * Dilengkapi dengan interaksi popup modal gambar resolusi penuh.
 */
export function LoveStoryGallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  return (
    <section id="galeri" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Cerita Cinta */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#526b5d]">
              Our Journey
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Kisah Perjalanan Cinta Kami
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {STORIES.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="rounded-3xl border border-border bg-[#faf7f2] p-6 text-center space-y-3 relative shadow-2xs"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#526b5d] text-white font-bold text-xs shadow-xs">
                  {item.year}
                </span>
                <h4 className="font-display text-base font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Galeri Foto */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
              Galeri Kenangan
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Momen-momen Indah
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GALLERY_IMAGES.map((photo, i) => (
              <motion.div
                key={photo.url}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setSelectedPhoto(photo.url)}
                className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-slate-200"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ImageIcon size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <img src={selectedPhoto} alt="" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </section>
  )
}
