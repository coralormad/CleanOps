import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface MiTurno {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  ubicaciones_portales: {
    nombre: string
    direccion: string | null
    latitud: number
    longitud: number
  } | null
}

export function useMisTurnos(empleadaId: string | undefined) {
  const [turnos, setTurnos] = useState<MiTurno[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!empleadaId) return

    async function cargar() {
      setCargando(true)
      const { data, error } = await supabase
        .from('turnos')
        .select(
          'id, dia_semana, hora_inicio, hora_fin, ubicaciones_portales ( nombre, direccion, latitud, longitud )'
        )
        .eq('empleada_id', empleadaId)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (!error && data) setTurnos(data as unknown as MiTurno[])
      setCargando(false)
    }

    cargar()
  }, [empleadaId])

  return { turnos, cargando }
}