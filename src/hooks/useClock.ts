import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

/**
 * Custom React Hook untuk mendapatkan waktu dan tanggal lokal saat ini secara real-time.
 * Melakukan pembaruan (tick) setiap 1 detik menggunakan `setInterval`.
 * 
 * @returns String waktu terformat dalam bahasa Indonesia (misal: "21 Agustus 23:15:00")
 * 
 * @example
 * const clock = useClock()
 * return <span>{clock}</span>
 */
export function useClock(): string {
  const [now, setNow] = useState(() => dayjs())

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return now.format('D MMMM HH:mm:ss')
}