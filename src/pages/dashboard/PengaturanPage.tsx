import { Breadcrumb } from '@/components/dashboard/Breadcrumb'

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Pengaturan' }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Pengaturan</h1>
      <p className="text-sm text-muted">Segera hadir.</p>
    </div>
  )
}