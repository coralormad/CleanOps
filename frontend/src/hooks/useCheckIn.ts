import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { haversineDistanceMeters, getCurrentPositionSafe } from '../lib/geoValidation'
import {
  encolarFichaje,
  obtenerFichajesPendientes,
  eliminarFichajePendiente,
} from '../lib/offlineQueue'

interface ResultadoFichaje {
  ok: boolean
  mensaje: string
}

async function subirFotoStorage(
  empleadaId: string,
  blob: Blob,
  nombreOriginal: string
): Promise<string | null> {
  const extension = nombreOriginal.split('.').pop() || 'jpg'
  const ruta = `${empleadaId}/${Date.now()}.${extension}`
  const { error } = await supabase.storage.from('fichajes').upload(ruta, blob)
  if (error) {
    console.error('Error subiendo foto', error)
    return null
  }
  const { data } = supabase.storage.from('fichajes').getPublicUrl(ruta)
  return data.publicUrl
}

async function insertarFichajeRemoto(params: {
  empleadaId: string
  codigoQr: string
  tipo: 'entrada' | 'salida'
  fechaHoraDispositivo: string
  fotoBlob?: Blob | null
  fotoNombre?: string | null
}): Promise<ResultadoFichaje> {
  const { data: ubicacion, error: errorUbicacion } = await supabase
    .from('ubicaciones_portales')
    .select('id, nombre, latitud, longitud, radio_geofence_metros')
    .eq('codigo_qr', params.codigoQr)
    .single()

  if (errorUbicacion || !ubicacion) {
    return { ok: false, mensaje: 'Código QR no reconocido' }
  }

  const posicion = await getCurrentPositionSafe()

  let metodo: 'qr_geo' | 'qr_sin_gps' = 'qr_sin_gps'
  let distanciaMetros: number | null = null
  let dentroDelRadio: boolean | null = null
  let lat: number | null = null
  let lon: number | null = null

  if (posicion) {
    metodo = 'qr_geo'
    lat = posicion.coords.latitude
    lon = posicion.coords.longitude
    distanciaMetros = haversineDistanceMeters(lat, lon, ubicacion.latitud, ubicacion.longitud)
    dentroDelRadio = distanciaMetros <= ubicacion.radio_geofence_metros
  }

  let fotoUrl: string | null = null
  if (params.fotoBlob && params.fotoNombre) {
    fotoUrl = await subirFotoStorage(params.empleadaId, params.fotoBlob, params.fotoNombre)
  }

  const datosFichaje: Record<string, unknown> = {
    empleada_id: params.empleadaId,
    ubicacion_id: ubicacion.id,
    tipo: params.tipo,
    metodo,
    latitud_capturada: lat,
    longitud_capturada: lon,
    distancia_metros: distanciaMetros,
    dentro_del_radio: dentroDelRadio,
    fecha_hora_dispositivo: params.fechaHoraDispositivo,
    estado_sincronizacion: 'sincronizado',
  }

  if (fotoUrl) {
    if (params.tipo === 'entrada') datosFichaje.foto_antes_url = fotoUrl
    if (params.tipo === 'salida') datosFichaje.foto_despues_url = fotoUrl
  }

  const { error: errorInsert } = await supabase.from('fichajes').insert(datosFichaje)
  if (errorInsert) {
    return { ok: false, mensaje: 'Error al guardar el fichaje: ' + errorInsert.message }
  }

  return {
    ok: true,
    mensaje:
      dentroDelRadio === false
        ? `Fichaje de ${params.tipo} registrado en ${ubicacion.nombre} (fuera del radio esperado, quedará marcado para revisión)`
        : `Fichaje de ${params.tipo} registrado en ${ubicacion.nombre}`,
  }
}

export function useCheckIn(empleadaId: string | undefined) {
  const [procesando, setProcesando] = useState(false)
  const [pendientes, setPendientes] = useState(0)

  const actualizarContadorPendientes = useCallback(async () => {
    const items = await obtenerFichajesPendientes()
    setPendientes(items.length)
  }, [])

  const registrarFichaje = async (
    codigoQr: string,
    tipo: 'entrada' | 'salida',
    foto?: File | null
  ): Promise<ResultadoFichaje> => {
    if (!empleadaId) return { ok: false, mensaje: 'No hay sesión activa' }

    setProcesando(true)
    const fechaHoraDispositivo = new Date().toISOString()

    try {
      if (!navigator.onLine) {
        await encolarFichaje({
          id: crypto.randomUUID(),
          empleadaId,
          codigoQr,
          tipo,
          fotoBlob: foto ?? null,
          fotoNombre: foto?.name ?? null,
          fechaHoraDispositivo,
        })
        await actualizarContadorPendientes()
        return {
          ok: true,
          mensaje: 'Sin conexión: fichaje guardado en el dispositivo, se enviará automáticamente al recuperar señal',
        }
      }

      try {
        return await insertarFichajeRemoto({
          empleadaId,
          codigoQr,
          tipo,
          fechaHoraDispositivo,
          fotoBlob: foto ?? null,
          fotoNombre: foto?.name ?? null,
        })
      } catch {
        await encolarFichaje({
          id: crypto.randomUUID(),
          empleadaId,
          codigoQr,
          tipo,
          fotoBlob: foto ?? null,
          fotoNombre: foto?.name ?? null,
          fechaHoraDispositivo,
        })
        await actualizarContadorPendientes()
        return {
          ok: true,
          mensaje: 'No se pudo conectar: fichaje guardado en el dispositivo, se reintentará automáticamente',
        }
      }
    } finally {
      setProcesando(false)
    }
  }

  const sincronizarPendientes = useCallback(async () => {
    const items = await obtenerFichajesPendientes()
    for (const item of items) {
      const resultado = await insertarFichajeRemoto({
        empleadaId: item.empleadaId,
        codigoQr: item.codigoQr,
        tipo: item.tipo,
        fechaHoraDispositivo: item.fechaHoraDispositivo,
        fotoBlob: item.fotoBlob,
        fotoNombre: item.fotoNombre,
      })
      if (resultado.ok) {
        await eliminarFichajePendiente(item.id)
      }
    }
    await actualizarContadorPendientes()
  }, [actualizarContadorPendientes])

  return { registrarFichaje, procesando, pendientes, actualizarContadorPendientes, sincronizarPendientes }
}