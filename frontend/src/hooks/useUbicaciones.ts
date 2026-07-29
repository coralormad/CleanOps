import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Ubicacion {
  id: string
  nombre: string
  direccion: string | null
  latitud: number
  longitud: number
  radio_geofence_metros: number
  codigo_qr: string
}

interface NuevaUbicacion {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  radio_geofence_metros: number
}

function generarCodigoQr(nombre: string): string {
  const slug = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20)
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${slug || 'EDIFICIO'}-${sufijo}`
}

export function useUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('ubicaciones_portales')
      .select('id, nombre, direccion, latitud, longitud, radio_geofence_metros, codigo_qr')
      .order('nombre', { ascending: true })

    if (!error && data) setUbicaciones(data)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = async (datos: NuevaUbicacion): Promise<{ ok: boolean; mensaje: string }> => {
    setGuardando(true)
    const codigo_qr = generarCodigoQr(datos.nombre)

    const { error } = await supabase.from('ubicaciones_portales').insert({
      nombre: datos.nombre,
      direccion: datos.direccion || null,
      latitud: datos.latitud,
      longitud: datos.longitud,
      radio_geofence_metros: datos.radio_geofence_metros,
      codigo_qr,
    })

    setGuardando(false)

    if (error) {
      return { ok: false, mensaje: 'Error al crear la ubicación: ' + error.message }
    }

    await cargar()
    return { ok: true, mensaje: `Ubicación creada. Código QR: ${codigo_qr}` }
  }

  return { ubicaciones, cargando, guardando, crear }
}