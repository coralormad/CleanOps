import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface PuntoDia {
  fecha: string
  etiqueta: string
  total: number
}

function ultimosNDias(n: number): string[] {
  const dias: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dias.push(d.toISOString().slice(0, 10))
  }
  return dias
}

export function useFichajesPorDia() {
  const [datos, setDatos] = useState<PuntoDia[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const dias = ultimosNDias(7)
      const desde = dias[0] + 'T00:00:00'

      const { data, error } = await supabase
        .from('fichajes')
        .select('fecha_hora_dispositivo')
        .gte('fecha_hora_dispositivo', desde)

      const conteos = new Map<string, number>()
      for (const dia of dias) conteos.set(dia, 0)

      if (!error && data) {
        for (const f of data) {
          const dia = f.fecha_hora_dispositivo.slice(0, 10)
          if (conteos.has(dia)) conteos.set(dia, (conteos.get(dia) ?? 0) + 1)
        }
      }

      const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
      const resultado = dias.map((dia) => {
        const fecha = new Date(dia + 'T12:00:00')
        return { fecha: dia, etiqueta: DIAS_CORTOS[fecha.getDay()], total: conteos.get(dia) ?? 0 }
      })

      setDatos(resultado)
      setCargando(false)
    }

    cargar()
  }, [])

  return { datos, cargando }
}