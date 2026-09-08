import {
  Grid2x2, Mail, CreditCard, Gift, Settings,
  Users, LayoutTemplate, Sparkles, BookUser, ClipboardCheck, Wallet,
  Scan, LayoutDashboard,
} from 'lucide-react'
import type { ReactNode } from 'react'

const ICON = 18

/**
 * Daftar menu navigasi khusus antarmuka Superadmin Buwuhan.
 */
export const adminNav: NavEntry[] = [
  { type: 'item', to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={ICON} />, end: true },
  { type: 'item', to: '/admin/users', label: 'Pengguna', icon: <Users size={ICON} /> },
  { type: 'item', to: '/admin/invitations', label: 'Moderasi Undangan', icon: <Mail size={ICON} /> },
{ type: 'item', to: '/admin/templates', label: 'Katalog Template', icon: <LayoutTemplate size={ICON} /> },
{ type: 'item', to: '/admin/langganan', label: 'Langganan', icon: <CreditCard size={ICON} /> },
]

/**
 * Daftar menu footer khusus panel Superadmin.
 */
export const adminNavFooter: NavEntry[] = [
  { type: 'item', to: '/admin/pengaturan', label: 'Pengaturan Akun', icon: <Settings size={ICON} /> },
]

/**
 * Tipe entri navigasi daun (Leaf) tunggal yang mengarah ke URL rute tertentu.
 */
export type NavLeaf = {
  type: 'item'
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

/**
 * Tipe grup menu navigasi (Accordion) dengan daftar anak menu.
 */
export type NavGroupDef = {
  type: 'group'
  label: string
  icon: ReactNode
  children: Array<{ to: string; label: string }>
}

/**
 * Gabungan tipe navigasi entri sidebar.
 */
export type NavEntry = NavLeaf | NavGroupDef

/**
 * Daftar menu navigasi utama pada Dashboard Buwuhan.
 */
export const dashboardNav: NavEntry[] = [
  { type: 'item', to: '/dashboard', label: 'Beranda', icon: <Grid2x2 size={ICON} />, end: true },
  { type: 'item', to: '/dashboard/undangan', label: 'Undangan', icon: <Mail size={ICON} /> },
  { type: 'item', to: '/dashboard/langganan', label: 'Langganan', icon: <CreditCard size={ICON} /> },
  { type: 'item', to: '/dashboard/buwuh', label: 'Catatan Buwuh', icon: <Gift size={ICON} /> },
]

/**
 * Daftar menu bagian bawah (footer) pada Dashboard Buwuhan.
 */
export const dashboardNavFooter: NavEntry[] = [
  { type: 'item', to: '/dashboard/pengaturan', label: 'Pengaturan', icon: <Settings size={ICON} /> },
]

/**
 * Membangun daftar entri navigasi kontekstual untuk panel pengelolaan per-undangan spesifik.
 * 
 * @param id - ID undangan yang sedang dikelola
 * @returns Array entri navigasi untuk panel undangan
 */
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
        { to: `${base}/rsvp`, label: 'Kehadiran' },
        { to: `${base}/hadiah`, label: 'Hadiah' },

      ],
    },
    { type: 'item', to: `${base}/catatan-buwuh`, label: 'Catatan Buwuh', icon: <Wallet size={ICON} /> },
    { type: 'item', to: `${base}/scan-qr`, label: 'Scan QR', icon: <Scan size={ICON} /> },
  ]
}

/**
 * Daftar menu bagian bawah (footer) pada panel per-undangan.
 */
export const panelNavFooter: NavEntry[] = [
  { type: 'item', to: '/dashboard/pengaturan', label: 'Pengaturan', icon: <Settings size={ICON} /> },
]

/**
 * Icon cadangan tambahan untuk referensi.
 */
export const extraIcons = { BookUser, ClipboardCheck }