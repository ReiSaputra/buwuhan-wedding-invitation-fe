import {
  Grid2x2, Mail, CreditCard, Gift, Settings,
  Users, LayoutTemplate, Sparkles, BookUser, ClipboardCheck, Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'

const ICON = 18

export type NavLeaf = {
  type: 'item'
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

export type NavGroupDef = {
  type: 'group'
  label: string
  icon: ReactNode
  children: Array<{ to: string; label: string }>
}

export type NavEntry = NavLeaf | NavGroupDef

/** Sidebar dashboard utama (Tahap 2) */
export const dashboardNav: NavEntry[] = [
  { type: 'item', to: '/dashboard', label: 'Beranda', icon: <Grid2x2 size={ICON} />, end: true },
  { type: 'item', to: '/dashboard/undangan', label: 'Undangan', icon: <Mail size={ICON} /> },
  { type: 'item', to: '/dashboard/langganan', label: 'Langganan', icon: <CreditCard size={ICON} /> },
  { type: 'item', to: '/dashboard/buwuh', label: 'Buwuh', icon: <Gift size={ICON} /> },
]

export const dashboardNavFooter: NavEntry[] = [
  { type: 'item', to: '/dashboard/pengaturan', label: 'Pengaturan', icon: <Settings size={ICON} /> },
]

/** Sidebar panel per undangan (desain kedua) */
export function buildPanelNav(id: string): NavEntry[] {
  const base = `/dashboard/undangan/${id}`
  return [
    { type: 'item', to: base, label: 'Beranda', icon: <Grid2x2 size={ICON} />, end: true },
    { type: 'item', to: `${base}/edit`, label: 'Edit Undangan', icon: <Mail size={ICON} /> },
    { type: 'item', to: `${base}/petugas`, label: 'Petugas', icon: <Users size={ICON} /> },
    { type: 'item', to: `${base}/template`, label: 'Template', icon: <LayoutTemplate size={ICON} /> },
    {
      type: 'group',
      label: 'Fitur',
      icon: <Sparkles size={ICON} />,
      children: [
        { to: `${base}/buku-tamu`, label: 'Buku Tamu' },
        { to: `${base}/rsvp`, label: 'RSVP' },
        { to: `${base}/hadiah`, label: 'Hadiah' },
      ],
    },
    { type: 'item', to: `${base}/catatan-buwuh`, label: 'Catatan Buwuh', icon: <Wallet size={ICON} /> },
  ]
}

export const panelNavFooter: NavEntry[] = [
  { type: 'item', to: '/dashboard/pengaturan', label: 'Pengaturan', icon: <Settings size={ICON} /> },
]

// Icon cadangan, dipakai di halaman lain
export const extraIcons = { BookUser, ClipboardCheck }