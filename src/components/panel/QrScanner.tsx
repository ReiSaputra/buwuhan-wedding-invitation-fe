import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export type QrScannerProps = {
  /** Menyalakan atau mematikan kamera */
  isActive: boolean
  /** Dipanggil setiap QR berhasil terbaca */
  onDecoded: (rawValue: string) => void
}

const ELEMENT_ID = 'buwuhan-qr-reader'

/**
 * Komponen pemindai QR berbasis kamera perangkat.
 * Kamera hanya menyala saat `isActive` bernilai true, dan otomatis
 * dimatikan saat komponen dilepas agar lampu kamera tidak menyala terus.
 */
export function QrScanner({ isActive, onDecoded }: QrScannerProps) {
  const onDecodedRef = useRef(onDecoded)

  // Sinkronisasi callback terbaru dilakukan di effect, bukan saat render,
  // agar tidak melanggar aturan lint react-hooks/refs.
  useEffect(() => {
    onDecodedRef.current = onDecoded
  }, [onDecoded])

  useEffect(() => {
    if (!isActive) return

    const scanner = new Html5Qrcode(ELEMENT_ID)

    void scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText: string) => onDecodedRef.current(decodedText),
      () => {
        // Frame tanpa QR diabaikan; tidak perlu menampilkan galat
      },
    )

    return () => {
      void scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => undefined)
    }
  }, [isActive])

  return (
    <div
      id={ELEMENT_ID}
      className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-indigo-400/60 bg-slate-800/60"
    />
  )
}