import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AsistenciaHoy {
  empleadaId: string
  nombreCompleto: string
  ok: boolean
  motivo: string
  horaFichaje: string | null
}

function diaSemanaHoy(): number {
  const dia = new Date().getDay()
  return dia === 0 ? 7 : dia
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

interface TurnoHoyCrudo {
  empleada_id: string
  empleadas: { nombre_completo: string } | null
}

interface FichajeHoyCrudo {
  empleada_id: string
  dentro_del_radio: boolean | null
  estado_revision: string
  fecha_hora_dispositivo: string
}

export function useAsistenciaHoy() {
  const [asistencia, setAsistencia] = useState<AsistenciaHoy[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const diaActual = diaSemanaHoy()

      const { data: turnosHoy, error: errorTurnos } = await supabase
        .from('turnos')
        .select('empleada_id, empleadas ( nombre_completo )')
        .eq('dia_semana', diaActual)

      if (errorTurnos || !turnosHoy) {
        setAsistencia([])
        setCargando(false)
        return
      }

      const empleadasUnicas = new Map<string, string>()
      for (const t of turnosHoy as unknown as TurnoHoyCrudo[]) {
        if (!empleadasUnicas.has(t.empleada_id)) {
          empleadasUnicas.set(t.empleada_id, t.empleadas?.nombre_completo ?? 'Empleada')
        }
      }

      const inicioHoy = hoyISO() + 'T00:00:00'
      const finHoy = hoyISO() + 'T23:59:59'

      const { data: fichajesHoy } = await supabase
        .from('fichajes')
        .select('empleada_id, dentro_del_radio, estado_revision, fecha_hora_dispositivo')
        .eq('tipo', 'entrada')
        .gte('fecha_hora_dispositivo', inicioHoy)
        .lte('fecha_hora_dispositivo', finHoy)

      const crudos = (fichajesHoy ?? []) as FichajeHoyCrudo[]
      const resultado: AsistenciaHoy[] = []

      for (const [empleadaId, nombreCompleto] of empleadasUnicas) {
        const fichaje = crudos.find((f) => f.empleada_id === empleadaId)

        if (!fichaje) {
          resultado.push({ empleadaId, nombreCompleto, ok: false, motivo: 'No ha fichado', horaFichaje: null })
        } else if (fichaje.dentro_del_radio === false || fichaje.estado_revision === 'rechazado') {
          resultado.push({ empleadaId, nombreCompleto, ok: false, motivo: 'Fichaje con incidencia', horaFichaje: fichaje.fecha_hora_dispositivo })
        } else {
          resultado.push({ empleadaId, nombreCompleto, ok: true, motivo: 'Fichado correctamente', horaFichaje: fichaje.fecha_hora_dispositivo })
        }
      }

      resultado.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
      setAsistencia(resultado)
      setCargando(false)
    }

    cargar()
  }, [])

  return { asistencia, cargando }
}