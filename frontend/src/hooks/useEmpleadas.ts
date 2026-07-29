import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Rol } from './useAuth'

export interface EmpleadaListado {
  id: string
  nombre_completo: string
  rol: Rol
  activo: boolean
}

interface NuevaEmpleada {
  nombreCompleto: string
  email: string
  password: string
}

export function useEmpleadas() {
  const [empleadas, setEmpleadas] = useState<EmpleadaListado[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('empleadas')
      .select('id, nombre_completo, rol, activo')
      .order('nombre_completo', { ascending: true })

    if (!error && data) setEmpleadas(data)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = async (datos: NuevaEmpleada): Promise<{ ok: boolean; mensaje: string }> => {
    setGuardando(true)
    const { data, error } = await supabase.functions.invoke('crear-empleada', {
      body: {
        email: datos.email,
        nombreCompleto: datos.nombreCompleto,
        password: datos.password,
      },
    })
    setGuardando(false)

    if (error) return { ok: false, mensaje: 'Error al crear la empleada: ' + error.message }
    if (data?.error) return { ok: false, mensaje: data.error }

    await cargar()
    return { ok: true, mensaje: `Empleada creada: ${datos.nombreCompleto}` }
  }

  const cambiarActivo = async (id: string, activo: boolean) => {
    await supabase.from('empleadas').update({ activo }).eq('id', id)
    await cargar()
  }

  return { empleadas, cargando, guardando, crear, cambiarActivo }
}