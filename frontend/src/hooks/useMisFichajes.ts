import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface MiFichaje {
  id: string
  tipo: 'entrada' | 'salida'
  fecha_hora_dispositivo: string
  estado_revision: 'pendiente' | 'aprobado' | 'rechazado'
  ubicaciones_portales: { nombre: string } | null
}

interface Filtros {
  desde?: string
  hasta?: string
  ubicacionId?: string
}

export function useMisFichajes(empleadaId: string | undefined, filtros: Filtros) {
  const [fichajes, setFichajes] = useState<MiFichaje[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!empleadaId) return
    setCargando(true)

    let query = supabase
      .from('fichajes')
      .select('id, tipo, fecha_hora_dispositivo, estado_revision, ubicaciones_portales ( nombre )')
      .eq('empleada_id', empleadaId)
      .order('fecha_hora_dispositivo', { ascending: false })
      .limit(100)

    if (filtros.desde) query = query.gte('fecha_hora_dispositivo', filtros.desde)
    if (filtros.hasta) query = query.lte('fecha_hora_dispositivo', filtros.hasta)
    if (filtros.ubicacionId) query = query.eq('ubicacion_id', filtros.ubicacionId)

    const { data, error } = await query

    if (!error && data) setFichajes(data as unknown as MiFichaje[])
    setCargando(false)
  }, [empleadaId, filtros.desde, filtros.hasta, filtros.ubicacionId])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { fichajes, cargando }
}