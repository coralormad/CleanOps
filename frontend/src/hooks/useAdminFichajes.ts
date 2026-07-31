import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { notificarEmpleada } from '../lib/notificaciones'

export interface FichajeConDetalle {
  id: string
  empleada_id: string
  tipo: 'entrada' | 'salida'
  metodo: string
  fecha_hora_dispositivo: string
  dentro_del_radio: boolean | null
  distancia_metros: number | null
  foto_antes_url: string | null
  foto_despues_url: string | null
  estado_revision: 'pendiente' | 'aprobado' | 'rechazado'
  empleadas: { nombre_completo: string } | null
  ubicaciones_portales: { nombre: string } | null
}

export function useAdminFichajes(revisorId: string | undefined) {
  const [fichajes, setFichajes] = useState<FichajeConDetalle[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('fichajes')
      .select(
        `id, empleada_id, tipo, metodo, fecha_hora_dispositivo, dentro_del_radio, distancia_metros,
         foto_antes_url, foto_despues_url, estado_revision,
         empleadas!fichajes_empleada_id_fkey ( nombre_completo ),
         ubicaciones_portales ( nombre )`
      )
      .order('fecha_hora_dispositivo', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error cargando fichajes', error)
    }

    if (!error && data) {
      setFichajes(data as unknown as FichajeConDetalle[])
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const revisar = async (fichajeId: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    if (!revisorId) return
    const fichaje = fichajes.find((f) => f.id === fichajeId)

    await supabase
      .from('fichajes')
      .update({
        estado_revision: nuevoEstado,
        revisado_por: revisorId,
        revisado_en: new Date().toISOString(),
      })
      .eq('id', fichajeId)

    if (fichaje) {
      const nombreUbicacion = fichaje.ubicaciones_portales?.nombre ?? 'un edificio'
      const mensajeAviso = 'Tu fichaje de ' + fichaje.tipo + ' en ' + nombreUbicacion + ' ha sido ' + nuevoEstado
      notificarEmpleada(fichaje.empleada_id, mensajeAviso, '/historial')
    }

    await cargar()
  }

  return { fichajes, cargando, revisar, recargar: cargar }
}