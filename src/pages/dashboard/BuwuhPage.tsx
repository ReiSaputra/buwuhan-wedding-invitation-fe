import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Package, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { TableCard } from '@/components/ui/TableCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/common/QueryState'
import { useAllBuwuhan } from '@/hooks/useAllBuwuhan'
import { useTableState } from '@/hooks/useTableState'
import { formatDateId, formatNumber, formatRupiah } from '@/lib/format'
import type { ApiOwnerBuwuhan } from '@/types/invitation-api'

const thClass = 'px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-5 py-4 align-middle'

/** Menjumlahkan estimasi nilai seluruh item dalam satu transaksi buwuh. */
function sumEstimatedValue(record: ApiOwnerBuwuhan): number {
  return record.items.reduce((total, item) => total + (item.estimatedValue ?? 0), 0)
}

/**
 * Halaman Catatan Buwuh tingkat dashboard: ikhtisar seluruh bantuan fisik
 * yang masuk dari semua undangan milik pengguna, lengkap dengan pencarian.
 */
export default function BuwuhPage() {
  const { records, summary, isLoading, isError } = useAllBuwuhan()

  const getSearchText = useCallback(
    (record: ApiOwnerBuwuhan) =>
      [
        record.giverName,
        record.invitationTitle,
        record.note ?? '',
        record.items.map((item) => `${item.itemName} ${item.category ?? ''}`).join(' '),
      ].join(' '),
    [],
  )

  const table = useTableState({ rows: records, pageSize: 10, getSearchText })

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Catatan Buwuh"
          value={formatNumber(summary.totalTransactions)}
          icon={<Package size={18} />}
          hint={`${formatNumber(summary.totalItems)} item tercatat`}
          colorAccent="emerald"
        />
        <StatCard
          label="Estimasi Nilai Bantuan"
          value={formatRupiah(summary.totalEstimatedValue)}
          icon={<TrendingUp size={18} />}
          hint="Akumulasi seluruh undangan"
          colorAccent="amber"
        />
        <StatCard
          label="Masuk Bulan Ini"
          value={formatNumber(summary.totalThisMonth)}
          icon={<Calendar size={18} />}
          hint="Dihitung dari tanggal diterima"
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
              placeholder="Cari pemberi, undangan, atau jenis bantuan..."
              className="sm:w-72"
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
                table.pageRows.map((record) => (
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
                      <div className="flex flex-wrap gap-1">
                        {record.items.map((item) => (
                          <Badge key={item.id} variant="default">
                            {item.category ?? item.itemName}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className={`${tdClass} text-slate-700`}>
                      {record.items.map((item) => (
                        <div key={item.id}>
                          {item.itemName} — {item.quantity} {item.unit}
                        </div>
                      ))}
                    </td>
                    <td className={`${tdClass} font-bold text-ink`}>
                      {formatRupiah(sumEstimatedValue(record))}
                    </td>
                    <td className={`${tdClass} text-slate-500`}>{formatDateId(record.receivedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </div>
  )
}