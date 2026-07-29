import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface ResultadoDireccion {
  display_name: string
  lat: string
  lon: string
}

interface Props {
  onSeleccionar: (direccion: string, lat: number, lon: number) => void
}

export function DireccionBuscador({ onSeleccionar }: Props) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<ResultadoDireccion[]>([])
  const [buscando, setBuscando] = useState(false)
  const [seleccionado, setSeleccionado] = useState<ResultadoDireccion | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (seleccionado) return
    if (texto.trim().length < 4) {
      setResultados([])
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&countrycodes=es&limit=5`
        const res = await fetch(url)
        const data = await res.json()
        setResultados(data)
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [texto, seleccionado])

  const seleccionar = (r: ResultadoDireccion) => {
    setSeleccionado(r)
    setTexto(r.display_name)
    setResultados([])
    onSeleccionar(r.display_name, parseFloat(r.lat), parseFloat(r.lon))
  }

  const reiniciar = () => {
    setSeleccionado(null)
    setTexto('')
    onSeleccionar('', 0, 0)
  }

  return (
    <div className="relative">
      <label className="text-xs text-muted block mb-1">Dirección del edificio</label>

      {!seleccionado ? (
        <>
          <div className="relative">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe una calle, número y ciudad..."
              className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            {buscando && (
              <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
            )}
          </div>

          {resultados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-black/10 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {resultados.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => seleccionar(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-black/5 border-b border-black/5 last:border-0 flex items-start gap-2"
                >
                  <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between gap-2 border border-black/10 rounded-lg px-3 py-2 bg-black/5">
          <p className="text-xs text-ink truncate">{seleccionado.display_name}</p>
          <button type="button" onClick={reiniciar} className="text-xs text-primary font-medium shrink-0">
            Cambiar
          </button>
        </div>
      )}
    </div>
  )
}