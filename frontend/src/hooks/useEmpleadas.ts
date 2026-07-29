import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Rol } from './useAuth'

export interface EmpleadaListado {
  id: string
  nombre_completo: string
  rol: Rol
}

export function useEmpleadas() {
  const [empleadas, setEmpleadas] = useState<EmpleadaListado[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('empleadas')
      .select('id, nombre_completo, rol')
      .order('nombre_completo', { ascending: true })

    if (!error && data) setEmpleadas(data)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { empleadas, cargando, recargar: cargar }
}