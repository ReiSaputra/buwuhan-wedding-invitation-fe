import { PlanCard } from '@/components/langganan/PlanCard'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePlans } from '@/hooks/usePlans'
import type { PlanCode } from '@/types/dashboard'

export default function LanggananPage() {
  const user = useCurrentUser()
  const { plans } = usePlans()

  function handleSelect(code: PlanCode) {
    // TODO: arahkan ke halaman pembayaran / buat transaksi
    console.log('pilih paket', code)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pt-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Paket Langganan</h1>
        <p className="mt-1 text-xs text-muted">
          Pilih paket yang sesuai dengan kebutuhan acaramu.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            isCurrent={plan.code === user.plan}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        Harga sudah termasuk pajak. Pembayaran diperpanjang otomatis setiap bulan dan
        bisa dibatalkan kapan saja.
      </p>
    </div>
  )
}