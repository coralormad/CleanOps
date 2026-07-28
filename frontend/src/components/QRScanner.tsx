import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (decodedText: string) => void
}

export function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const contenedorId = 'qr-reader'

  useEffect(() => {
    const scanner = new Html5Qrcode(contenedorId)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          onScan(decodedText)
          scanner.stop().catch(() => {})
        },
        () => {}
      )
      .catch((err) => {
        console.error('No se pudo iniciar la cámara', err)
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return <div id={contenedorId} className="w-full max-w-sm mx-auto" />
}