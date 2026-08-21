import { Breadcrumb } from '@/components/dashboard/Breadcrumb'

export default function BuwuhPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Beranda', to: '/dashboard' }, { label: 'Buwuh' }]} />
      <h1 className="font-display text-3xl font-semibold text-ink">Buwuh</h1>
      <p className="text-sm text-muted">Segera hadir.</p>
    </div>
  )
}