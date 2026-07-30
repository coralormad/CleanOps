import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface FichajeFueraRadio {
  id: string
  tipo: string
  fecha_hora_dispositivo: string
  distancia_metros: number | null
  empleadas: { nombre_completo: string } | null
  ubicaciones_portales: { nombre: string } | null
}

interface Filtros {
  desde: string
  hasta: string
}

export function useInformeFueraDeRadio(filtros: Filtros) {
  const [fichajes, setFichajes] = useState<FichajeFueraRadio[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('fichajes')
      .select('id, tipo, fecha_hora_dispositivo, distancia_metros, empleadas!fichajes_empleada_id_fkey ( nombre_completo ), ubicaciones_portales ( nombre )')
      .eq('dentro_del_radio', false)
      .gte('fecha_hora_dispositivo', filtros.desde)
      .lte('fecha_hora_dispositivo', filtros.hasta)
      .order('fecha_hora_dispositivo', { ascending: false })

    if (!error && data) setFichajes(data as unknown as FichajeFueraRadio[])
    setCargando(false)
  }, [filtros.desde, filtros.hasta])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { fichajes, cargando }
}