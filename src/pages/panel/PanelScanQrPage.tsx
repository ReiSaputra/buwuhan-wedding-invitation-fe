import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, CameraOff, CheckCircle2, UsersRound, XCircle } from 'lucide-react'
import { PanelPageHeader } from '@/components/panel/PanelPageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { QrScanner } from '@/components/panel/QrScanner'
import { QueryState } from '@/components/common/QueryState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TableCard } from '@/components/ui/TableCard'
import { useInvitationDetail } from '@/hooks/useInvitationDetail'
import { useCheckIn } from '@/hooks/useCheckIn'
import { extractQrCode } from '@/lib/qr'
import { formatNumber, formatTimeWib, getInitial } from '@/lib/format'

type ScanFeedback = { tone: 'success' | 'error'; text: string }

const thClass = 'px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'
const tdClass = 'px-6 py-4 align-middle'

/**
 * Halaman Scan QR: memindai kartu undangan tamu lewat kamera atau input
 * manual, lalu mencatat kehadiran nyata ke backend melalui endpoint check-in.
 */
export default function PanelScanQrPage() {
  const { id = '' } = useParams()
  const { invitation } = useInvitationDetail(id)
  const { recentCheckIns, stats, checkInByQr, isLoading, isError, isMutating } = useCheckIn(id)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)

  /**
   * Mengirim token QR ke backend dan menampilkan hasilnya ke petugas.
   *
   * @param raw - Teks mentah dari kamera atau kotak input manual
   */
  const handleSubmitCode = useCallback(
    async (raw: string) => {
      const qrCode = extractQrCode(raw)
      if (!qrCode || isMutating) return

      try {
        const guest = await checkInByQr(qrCode)
        setFeedback({
          tone: 'success',
          text: `Check-in berhasil: ${guest.name} (${guest.paxCount} pax)`,
        })
      } catch {
        setFeedback({
          tone: 'error',
          text: 'Kode tidak dikenali atau tamu sudah tercatat hadir.',
        })
      } finally {
        setManualCode('')
        setTimeout(() => setFeedback(null), 4000)
      }
    },
    [checkInByQr, isMutating],
  )

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PanelPageHeader
        crumbs={[
          { label: 'Beranda', to: '/dashboard' },
          { label: `Panel ${invitation.coupleName || invitation.panelName}`, to: `/dashboard/undangan/${id}` },
          { label: 'Scan QR' },
        ]}
        title="Scan QR Kehadiran"
        subtitle="Pindai kartu undangan tamu untuk mencatat kehadiran secara real-time."
        actions={
          <Button
            variant={isCameraOn ? 'outline' : 'primary'}
            icon={isCameraOn ? <CameraOff size={15} /> : <Camera size={15} />}
            onClick={() => setIsCameraOn((prev) => !prev)}
          >
            {isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Tamu" value={formatNumber(stats.totalGuests)} icon={<UsersRound size={18} />} colorAccent="indigo" />
        <StatCard label="Sudah Check-in" value={formatNumber(stats.totalAttended)} icon={<CheckCircle2 size={18} />} variant="filled" hint={`${formatNumber(stats.totalPaxActual)} orang hadir`} />
        <StatCard label="Belum Hadir" value={formatNumber(stats.totalPending)} icon={<XCircle size={18} />} colorAccent="amber" />
      </div>

      <QueryState isLoading={isLoading} isError={isError}>
        <div className="grid items-start gap-6 md:grid-cols-2">
          {/* Panel kamera */}
          <div className="space-y-4 rounded-3xl border border-border bg-slate-900 p-6 text-center text-white shadow-xl">
            {isCameraOn ? (
              <QrScanner isActive={isCameraOn} onDecoded={(value) => void handleSubmitCode(value)} />
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-800/60">
                <Camera size={44} className="text-slate-600" />
              </div>
            )}
            <p className="text-xs text-slate-300">
              Arahkan kamera ke QR Code pada kartu undangan digital tamu.
            </p>
          </div>

          {/* Input manual + notifikasi */}
          <div className="space-y-4">
            {feedback && (
              <div
                className={`animate-in zoom-in-95 flex items-start gap-3 rounded-2xl border p-4 ${
                  feedback.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                {feedback.tone === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <XCircle size={20} className="mt-0.5 shrink-0" />}
                <span className="text-xs font-semibold">{feedback.text}</span>
              </div>
            )}

            <form
              className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-xs"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmitCode(manualCode)
              }}
            >
              <h3 className="font-display text-base font-bold text-ink">Input Kode Manual</h3>
              <p className="text-xs text-muted">
                Bila kamera bermasalah, tempel token QR atau tautan undangan tamu di sini.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  placeholder="Token QR atau tautan undangan"
                  className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!manualCode || isMutating}>
                  {isMutating ? 'Memproses…' : 'Check-in'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Riwayat check-in terbaru */}
        <TableCard title="Check-in Terbaru">
          <table className="w-full min-w-2xl text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <th className={thClass}>Nama Tamu</th>
                <th className={thClass}>Kategori</th>
                <th className={thClass}>Pax</th>
                <th className={thClass}>Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCheckIns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    Belum ada tamu yang check-in.
                  </td>
                </tr>
              )}
              {recentCheckIns.map((guest) => (
                <tr key={guest.id} className="transition hover:bg-slate-50/70">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100/80 bg-indigo-50 text-xs font-bold text-primary">
                        {getInitial(guest.name)}
                      </div>
                      <span className="text-xs font-bold text-ink">{guest.name}</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <Badge variant="default">{guest.category ?? 'Tanpa Kategori'}</Badge>
                  </td>
                  <td className={tdClass}>{guest.paxActual ?? guest.paxCount} orang</td>
                  <td className={tdClass}>{guest.checkedInAt ? formatTimeWib(guest.checkedInAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </div>
  )
}