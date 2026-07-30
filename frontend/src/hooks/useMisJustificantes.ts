import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { notificarStaff } from '../lib/notificaciones'

export type TipoJustificante = 'vacaciones' | 'baja_medica' | 'asuntos_propios' | 'otro'

export interface MiJustificante {
  id: string
  tipo: TipoJustificante
  fecha_inicio: string
  fecha_fin: string
  motivo: string | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
}

interface NuevoJustificante {
  tipo: TipoJustificante
  fechaInicio: string
  fechaFin: string
  motivo: string
}

export function useMisJustificantes(empleadaId: string | undefined, nombreEmpleada?: string) {
  const [justificantes, setJustificantes] = useState<MiJustificante[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    if (!empleadaId) return
    setCargando(true)
    const { data, error } = await supabase
      .from('justificantes')
      .select('id, tipo, fecha_inicio, fecha_fin, motivo, estado, created_at')
      .eq('empleada_id', empleadaId)
      .order('created_at', { ascending: false })

    if (!error && data) setJustificantes(data)
    setCargando(false)
  }, [empleadaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = async (datos: NuevoJustificante): Promise<{ ok: boolean; mensaje: string }> => {
    if (!empleadaId) return { ok: false, mensaje: 'No hay sesion activa' }
    setGuardando(true)

    const { error } = await supabase.from('justificantes').insert({
      empleada_id: empleadaId,
      tipo: datos.tipo,
      fecha_inicio: datos.fechaInicio,
      fecha_fin: datos.fechaFin,
      motivo: datos.motivo || null,
    })
    setGuardando(false)

    if (error) return { ok: false, mensaje: 'Error al enviar el justificante: ' + error.message }

    const nombre = nombreEmpleada ?? 'Una empleada'
    notificarStaff(nombre + ' ha enviado un justificante de ' + datos.tipo, '/admin/solicitudes')

    await cargar()
    return { ok: true, mensaje: 'Justificante enviado correctamente' }
  }

  const cancelar = async (id: string) => {
    await supabase.from('justificantes').delete().eq('id', id)
    await cargar()
  }

  return { justificantes, cargando, guardando, crear, cancelar }
}