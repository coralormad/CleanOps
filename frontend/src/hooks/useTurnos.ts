import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TurnoConDetalle {
  id: string
  empleada_id: string
  ubicacion_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  empleadas: { nombre_completo: string } | null
  ubicaciones_portales: { nombre: string } | null
}

interface NuevoTurno {
  empleadaId: string
  ubicacionId: string
  diaSemana: number
  horaInicio: string
  horaFin: string
}

export function useTurnos() {
  const [turnos, setTurnos] = useState<TurnoConDetalle[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('turnos')
      .select(
        `id, empleada_id, ubicacion_id, dia_semana, hora_inicio, hora_fin,
         empleadas ( nombre_completo ),
         ubicaciones_portales ( nombre )`
      )
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (!error && data) setTurnos(data as unknown as TurnoConDetalle[])
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = async (datos: NuevoTurno): Promise<{ ok: boolean; mensaje: string }> => {
    setGuardando(true)
    const { error } = await supabase.from('turnos').insert({
      empleada_id: datos.empleadaId,
      ubicacion_id: datos.ubicacionId,
      dia_semana: datos.diaSemana,
      hora_inicio: datos.horaInicio,
      hora_fin: datos.horaFin,
    })
    setGuardando(false)

    if (error) return { ok: false, mensaje: 'Error al crear el turno: ' + error.message }
    await cargar()
    return { ok: true, mensaje: 'Turno creado correctamente' }
  }

  const eliminar = async (id: string) => {
    await supabase.from('turnos').delete().eq('id', id)
    await cargar()
  }

  return { turnos, cargando, guardando, crear, eliminar }
}