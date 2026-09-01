/**
 * Definisi tema visual per template.
 *
 * Objek ini HANYA berisi string kelas Tailwind dan flag boolean — bukan
 * komponen React — sehingga aman terhadap aturan lint
 * `react-hooks/static-components` yang melarang komponen disimpan sebagai
 * nilai objek.
 *
 * Setiap tema dipetakan ke slug template dari backend di TemplateRenderer.tsx.
 */
export type TemplateTheme = {
  /** Penanda tema, dipakai untuk atribut data-* saat debugging */
  key: string

  /** Wrapper terluar halaman undangan */
  page: string

  /** Latar section cover */
  cover: string
  /** Tampilkan ornamen bulat blur di cover? */
  coverOrnament: boolean
  /** Badge "The Wedding Of" di atas cover */
  coverBadge: string
  /** Nama kedua mempelai di cover */
  coverTitle: string
  /** Karakter "&" pemisah nama */
  coverAmp: string
  /** Teks tanggal acara di cover */
  coverDate: string
  /** Kartu "Kepada Yth" */
  coverCard: string
  /** Label kecil di dalam kartu */
  coverCardLabel: string
  /** Nama tamu di dalam kartu */
  coverCardName: string
  /** Catatan miring di dalam kartu */
  coverCardNote: string
  /** Tombol "Buka Undangan" */
  coverButton: string
  /** Lingkaran ikon hati di cover */
  coverIconRing: string
  coverIconInner: string
  coverIcon: string

  /** Pembungkus HeroIntroSection */
  heroWrapper: string

  /** Footer */
  footer: string
  footerText: string
  footerTitle: string
  footerMeta: string
  /** Tampilkan ikon Sparkles di footer? */
  footerSparkles: boolean
}

/** Javanese Classic — gelap, mewah, aksen emas */
export const THEME_KLASIK: TemplateTheme = {
  key: 'klasik',
page: 'min-h-screen bg-inv-page font-body text-inv-ink',
  cover: 'bg-gradient-to-b from-slate-900 via-slate-800 to-black',
  coverOrnament: true,
  coverBadge: 'bg-white/10 text-amber-200 border border-amber-200/20 backdrop-blur-xs',
  coverTitle: 'font-display font-bold tracking-tight text-white',
  coverAmp: 'text-gold font-serif italic',
  coverDate: 'text-amber-200/80',
  coverCard: 'rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xs',
  coverCardLabel: 'text-white/60',
  coverCardName: 'font-display font-bold text-white',
  coverCardNote: 'text-white/50 italic',
  coverButton: 'bg-gold text-slate-900 shadow-lg shadow-gold/20 hover:brightness-110',
  coverIconRing: 'bg-gradient-to-tr from-gold/40 to-amber-200/20',
  coverIconInner: 'bg-slate-900',
  coverIcon: 'text-gold fill-gold/20',
  heroWrapper: 'rounded-b-3xl bg-slate-800 shadow-xl pb-10',
  footer: 'bg-black text-white',
  footerText: 'text-white/70 tracking-widest uppercase font-semibold',
  footerTitle: 'font-display font-bold text-gold',
  footerMeta: 'border-t border-white/10 text-white/50',
  footerSparkles: true,
}

/** Royal Floral — krem hangat, lembut, aksen emas dan sage */
export const THEME_ELEGAN: TemplateTheme = {
  key: 'elegan',
page: 'min-h-screen bg-inv-page font-body text-inv-ink',
  cover: 'bg-gradient-to-b from-cream via-cream-warm to-cream-deep',
  coverOrnament: true,
  coverBadge: 'bg-white/80 text-sage border border-sage/15 shadow-xs backdrop-blur-xs',
  coverTitle: 'font-display font-bold tracking-tight text-night',
  coverAmp: 'text-gold font-serif italic',
  coverDate: 'text-sage',
  coverCard: 'rounded-2xl border border-white/80 bg-white/70 shadow-xs backdrop-blur-xs',
  coverCardLabel: 'text-night-muted',
  coverCardName: 'font-display font-bold text-night',
  coverCardNote: 'text-sage italic',
  coverButton: 'bg-sage text-white shadow-lg shadow-sage/30 hover:bg-sage-dark',
  coverIconRing: 'bg-gradient-to-tr from-gold/30 to-sage/20',
  coverIconInner: 'bg-white/90',
  coverIcon: 'text-gold fill-gold/20',
  heroWrapper: '',
  footer: 'bg-night text-white',
  footerText: 'text-white/70 tracking-widest uppercase font-semibold',
  footerTitle: 'font-display font-bold text-gold',
  footerMeta: 'border-t border-white/10 text-white/50',
  footerSparkles: true,
}

/** Modern Minimalist — serba putih, tipografi berspasi lebar, tanpa ornamen */
export const THEME_MINIMALIS: TemplateTheme = {
  key: 'minimalis',
page: 'min-h-screen bg-inv-page font-body text-inv-ink',
  cover: 'bg-white',
  coverOrnament: false,
  coverBadge: 'bg-slate-50 text-slate-500 border border-slate-200 tracking-[0.3em]',
  coverTitle: 'font-body font-light tracking-[0.15em] text-slate-800',
  coverAmp: 'text-slate-400 font-light',
  coverDate: 'text-slate-400 tracking-[0.25em]',
  coverCard: 'rounded-none border-y border-slate-200 bg-transparent',
  coverCardLabel: 'text-slate-400 tracking-[0.2em] uppercase',
  coverCardName: 'font-body font-light tracking-[0.15em] text-slate-800',
  coverCardNote: 'text-slate-400',
  coverButton: 'bg-slate-900 text-white tracking-[0.2em] uppercase hover:bg-slate-700',
  coverIconRing: 'bg-slate-100',
  coverIconInner: 'bg-white',
  coverIcon: 'text-slate-400',
  heroWrapper: 'bg-white border-b border-slate-100 pb-8',
  footer: 'bg-slate-50 text-slate-600 border-t border-slate-200',
  footerText: 'text-slate-500 tracking-[0.15em] uppercase',
  footerTitle: 'font-body font-light tracking-[0.2em] uppercase text-slate-800',
  footerMeta: 'text-slate-400',
  footerSparkles: false,
}

/** Khitanan Ceria Blue — biru cerah, ramah anak */
export const THEME_CERIA: TemplateTheme = {
  key: 'ceria',
  page: 'min-h-screen bg-inv-page font-body text-inv-ink',
  cover: 'bg-gradient-to-b from-sky-100 via-sky-50 to-white',
  coverOrnament: true,
  coverBadge: 'bg-white text-sky-600 border border-sky-200 shadow-xs',
  coverTitle: 'font-display font-bold tracking-tight text-sky-900',
  coverAmp: 'text-sky-400 font-serif italic',
  coverDate: 'text-sky-600',
  coverCard: 'rounded-3xl border border-sky-200 bg-white shadow-sm',
  coverCardLabel: 'text-slate-500',
  coverCardName: 'font-display font-bold text-sky-900',
  coverCardNote: 'text-sky-500 italic',
  coverButton: 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600',
  coverIconRing: 'bg-gradient-to-tr from-sky-300/40 to-sky-100',
  coverIconInner: 'bg-white',
  coverIcon: 'text-sky-500 fill-sky-200',
  heroWrapper: 'rounded-b-[2.5rem] bg-white shadow-sm pb-10',
  footer: 'bg-sky-900 text-white',
  footerText: 'text-sky-100/80 tracking-widest uppercase font-semibold',
  footerTitle: 'font-display font-bold text-sky-200',
  footerMeta: 'border-t border-white/10 text-sky-200/60',
  footerSparkles: false,
}

/** Rasulan Syukuran Gold — cokelat keemasan, nuansa syukuran */
export const THEME_SYUKURAN: TemplateTheme = {
  key: 'syukuran',
  page: 'min-h-screen bg-inv-page font-body text-inv-ink',
  cover: 'bg-gradient-to-b from-amber-100 via-amber-50 to-stone-50',
  coverOrnament: true,
  coverBadge: 'bg-white/90 text-amber-700 border border-amber-300/50 shadow-xs',
  coverTitle: 'font-display font-bold tracking-tight text-amber-900',
  coverAmp: 'text-amber-600 font-serif italic',
  coverDate: 'text-amber-700',
  coverCard: 'rounded-2xl border border-amber-200 bg-white/80 shadow-xs backdrop-blur-xs',
  coverCardLabel: 'text-stone-500',
  coverCardName: 'font-display font-bold text-amber-900',
  coverCardNote: 'text-amber-600 italic',
  coverButton: 'bg-amber-700 text-white shadow-lg shadow-amber-700/30 hover:bg-amber-800',
  coverIconRing: 'bg-gradient-to-tr from-amber-400/40 to-amber-100',
  coverIconInner: 'bg-white',
  coverIcon: 'text-amber-600 fill-amber-200',
  heroWrapper: 'rounded-b-3xl bg-white/70 shadow-sm pb-10',
  footer: 'bg-stone-900 text-white',
  footerText: 'text-amber-100/80 tracking-widest uppercase font-semibold',
  footerTitle: 'font-display font-bold text-amber-300',
  footerMeta: 'border-t border-white/10 text-amber-200/60',
  footerSparkles: true,
}