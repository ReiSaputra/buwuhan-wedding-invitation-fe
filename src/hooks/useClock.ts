import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

export function useClock() {
  const [now, setNow] = useState(() => dayjs())

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return now.format('D MMMM HH:mm:ss')
}