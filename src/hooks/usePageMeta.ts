import { useEffect } from 'react'

export type PageMeta = {
  title: string
  description?: string
  imageUrl?: string
  url?: string
}

/**
 * Menyetel atau membuat satu tag <meta> di dalam <head>.
 *
 * @param attr - Nama atribut penanda ('name' untuk meta biasa, 'property' untuk Open Graph)
 * @param key - Nilai atribut penanda, misal 'og:title'
 * @param content - Isi meta tag
 */
function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

/**
 * Custom React Hook untuk memperbarui judul halaman dan meta tag Open Graph
 * sesuai data yang sedang ditampilkan.
 *
 * Catatan penting: karena aplikasi ini berupa SPA tanpa server-side rendering,
 * perayap (crawler) WhatsApp, Facebook, dan Twitter TIDAK menjalankan JavaScript
 * sehingga tidak akan melihat perubahan ini. Untuk pratinjau tautan yang benar,
 * diperlukan prerender atau SSR di sisi server. Hook ini tetap berguna untuk
 * judul tab peramban, riwayat, dan bookmark.
 *
 * @param meta - Judul, deskripsi, gambar, dan URL kanonik halaman
 */
export function usePageMeta(meta: PageMeta) {
  const { title, description, imageUrl, url } = meta

  useEffect(() => {
    if (!title) return

    const previousTitle = document.title
    document.title = title

    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:type', 'website')

    if (description) {
      setMetaTag('name', 'description', description)
      setMetaTag('property', 'og:description', description)
    }

    if (imageUrl) {
      setMetaTag('property', 'og:image', imageUrl)
      setMetaTag('name', 'twitter:card', 'summary_large_image')
    }

    if (url) {
      setMetaTag('property', 'og:url', url)
    }

    return () => {
      document.title = previousTitle
    }
  }, [title, description, imageUrl, url])
}