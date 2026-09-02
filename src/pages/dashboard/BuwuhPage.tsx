import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Gift, Wheat } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/common/QueryState'
import { useAllBuwuhan } from '@/hooks/useAllBuwuhan'
import { useTableState } from '@/hooks/useTableState'
import { formatDateId, formatNumber, formatRupiah } from '@/lib/format'
import { calculateBuwuhStats, getBuwuhanCategory } from '@/lib/buwuhHelper'
import type { ApiOwnerBuwuhan, BuwuhanCategory } from '@/types/invitation-api'

const thClass = 'px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'

/** Menjumlahkan estimasi nilai seluruh item dalam satu transaksi buwuh. */
function sumEstimatedValue(record: ApiOwnerBuwuhan): number {
  return record.items.reduce((total, item) => total + (item.estimatedValue ?? 0), 0)
}

/** Komponen badge penanda 3 jenis bantuan utama */
function CategoryBadge({ category }: { category: BuwuhanCategory }) {
  if (category === 'Uang') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs">
        <Banknote size={12} className="text-emerald-600" />
        Uang
      </span>
    )
  }

  if (category === 'Beras') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 shadow-2xs">
        <Wheat size={12} className="text-amber-600" />
        Beras
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-2xs">
      <Gift size={12} className="text-indigo-600" />
      Barang
    </span>
  )
}

/**
 * Halaman Catatan Buwuh tingkat dashboard: ikhtisar seluruh bantuan fisik & finansial
 * (Total Uang, Total Beras, Total Barang) yang masuk dari semua undangan.
 */
export default function BuwuhPage() {
  const { records, isLoading, isError } = useAllBuwuhan()

  const stats = useMemo(() => calculateBuwuhStats(records), [records])

  const getSearchText = useCallback(
    (record: ApiOwnerBuwuhan) =>
      [
        record.giverName,
        record.invitationTitle,
        record.note ?? '',
        record.items
          .map((item) => `${item.itemName} ${getBuwuhanCategory(item)} ${item.unit}`)
          .join(' '),
      ].join(' '),
    [],
  )

  const table = useTableState({ rows: records, pageSize: 10, getSearchText })

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* 3 Kartu Statistik Utama: Total Uang, Total Beras, dan Total Barang */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Uang"
          value={formatRupiah(stats.totalMoney)}
          icon={<Banknote size={18} />}
          hint={`${formatNumber(stats.moneyTransactions)} amplop / transaksi uang`}
          colorAccent="emerald"
        />
        <StatCard
          label="Total Beras"
          value={`${formatNumber(stats.totalRiceKg)} kg`}
          icon={<Wheat size={18} />}
          hint={`${formatNumber(stats.riceTransactions)} pemberian beras tercatat`}
          colorAccent="amber"
        />
        <StatCard
          label="Total Barang"
          value={`${formatNumber(stats.totalGoodsCount)} Item`}
          icon={<Gift size={18} />}
          hint={`${formatNumber(stats.goodsTransactions)} jenis barang fisik tercatat`}
          colorAccent="violet"
        />
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        <TableCard
          title="Riwayat Bantuan"
          toolbar={
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari pemberi, undangan, atau jenis bantuan (uang, beras, barang)..."
              className="sm:w-80"
            />
          }
          footerLeft={
            table.total === 0
              ? 'Belum ada catatan buwuh'
              : `Menampilkan ${table.from}-${table.to} dari ${formatNumber(table.total)} catatan`
          }
          footerRight={
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          }
        >
          <table className="w-full min-w-3xl text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className={thClass}>Pemberi / Tamu</th>
                <th className={thClass}>Acara Undangan</th>
                <th className={thClass}>Jenis Bantuan</th>
                <th className={thClass}>Jumlah / Rincian</th>
                <th className={thClass}>Estimasi Nilai</th>
                <th className={thClass}>Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted">
                    Belum ada catatan bantuan. Tambahkan dari panel undangan masing-masing.
                  </td>
                </tr>
              ) : (
                table.pageRows.map((record) => {
                  // Ambil kategori unik dari tiap transaksi
                  const categories = Array.from(
                    new Set(record.items.map((item) => getBuwuhanCategory(item))),
                  )

                  return (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
                      <td className={tdClass}>
                        <p className="font-bold text-ink">{record.giverName}</p>
                        {record.note && (
                          <p className="mt-0.5 max-w-xs truncate text-[11px] italic text-slate-500">
                            "{record.note}"
                          </p>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Link
                          to={`/dashboard/undangan/${record.invitationId}/catatan-buwuh`}
                          className="font-medium text-primary hover:underline"
                        >
                          {record.invitationTitle}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.map((cat) => (
                            <CategoryBadge key={cat} category={cat} />
                          ))}
                        </div>
                      </td>
                      <td className={`${tdClass} text-slate-700`}>
                        <div className="space-y-1">
                          {record.items.map((item) => {
                            const cat = getBuwuhanCategory(item)
                            return (
                              <div key={item.id} className="text-xs">
                                <span className="font-semibold text-slate-800">
                                  {item.itemName}
                                </span>
                                <span className="text-slate-500">
                                  {' '}
                                  —{' '}
                                  {cat === 'Uang'
                                    ? formatRupiah(item.estimatedValue ?? item.quantity)
                                    : `${item.quantity} ${item.unit}`}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className={`${tdClass} font-bold text-ink`}>
                        {formatRupiah(sumEstimatedValue(record))}
                      </td>
                      <td className={`${tdClass} text-slate-500`}>
                        {formatDateId(record.receivedAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </div>
  )
}