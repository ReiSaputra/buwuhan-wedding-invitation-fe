import { useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { CatatanBuwuhMandiriTab } from '@/components/buwuh/CatatanBuwuhMandiriTab'
import { CatatanBuwuhEventTab } from '@/components/buwuh/CatatanBuwuhEventTab'
import { UserCheck, CalendarCheck2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type BuwuhTab = 'mandiri' | 'event'

/**
 * Halaman Utama Catatan Buwuh Dashboard:
 * Menyediakan dua menu/tab terpisah:
 * 1. Catatan Buwuh Mandiri (pencatatan pribadi user tanpa terikat event).
 * 2. Catatan Buwuh Event (pencatatan buwuh per-event, dropdown hanya menampilkan event yang berstatus selesai).
 */
export default function BuwuhPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: BuwuhTab = rawTab === 'event' ? 'event' : 'mandiri'

  function handleTabChange(tab: BuwuhTab) {
    setSearchParams({ tab })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/dashboard' },
          { label: 'Catatan Buwuh' },
        ]}
      />

      {/* Header Halaman & Navigasi Tab */}
      <div className="rounded-3xl bg-white p-6 border border-border shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Catatan Buwuh
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Pencatatan buku tamu & amplop buwuhan (uang, beras, dan barang) baik mandiri maupun per event.
            </p>
          </div>
        </div>

        {/* Tab Switcher Segmented Control */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
          <button
            type="button"
            onClick={() => handleTabChange('mandiri')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
              activeTab === 'mandiri'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
            )}
          >
            <UserCheck size={16} />
            <span>Catatan Buwuh Mandiri</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('event')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
              activeTab === 'event'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
            )}
          >
            <CalendarCheck2 size={16} />
            <span>Catatan Buwuh Event</span>
          </button>
        </div>
      </div>

      {/* Render Tab Konten Aktif */}
      {activeTab === 'mandiri' ? (
        <CatatanBuwuhMandiriTab />
      ) : (
        <CatatanBuwuhEventTab />
      )}
    </div>
  )
}