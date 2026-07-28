import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (decodedText: string) => void
}

export function QRScanner({ onScan }: Props) {
  const detenidoRef = useRef(false)
  const contenedorId = 'qr-reader'

  useEffect(() => {
    detenidoRef.current = false
    const scanner = new Html5Qrcode(contenedorId)

    const detenerSeguro = async () => {
      if (detenidoRef.current) return
      detenidoRef.current = true
      try {
        await scanner.stop()
      } catch {
        // Ya estaba detenida o nunca llegó a arrancar del todo — no pasa nada.
      }
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          detenerSeguro().finally(() => onScan(decodedText))
        },
        () => {}
      )
      .catch((err) => {
        console.error('No se pudo iniciar la cámara', err)
      })

    return () => {
      detenerSeguro()
    }
  }, [onScan])

  return <div id={contenedorId} className="w-full max-w-sm mx-auto" />
}