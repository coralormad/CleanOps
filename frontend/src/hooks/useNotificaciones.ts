import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Rol } from './useAuth'

export interface Notificacion {
  id: string
  mensaje: string
  enlace: string | null
  leida: boolean
  created_at: string
}

export function useNotificaciones(empleadaId: string | undefined, rol: Rol | undefined) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!empleadaId || !rol) return
    setCargando(true)

    const esStaff = rol === 'supervisor' || rol === 'gerencia'

    const query = esStaff
      ? supabase
          .from('notificaciones')
          .select('id, mensaje, enlace, leida, created_at')
          .eq('destino', 'staff')
      : supabase
          .from('notificaciones')
          .select('id, mensaje, enlace, leida, created_at')
          .eq('destino', 'empleada_especifica')
          .eq('destinatario_id', empleadaId)

    const { data, error } = await query.order('created_at', { ascending: false }).limit(20)

    if (!error && data) setNotificaciones(data)
    setCargando(false)
  }, [empleadaId, rol])

  useEffect(() => {
    cargar()
  }, [cargar])

  const marcarLeida = async (id: string) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id)
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  const marcarTodasLeidas = async () => {
    const idsNoLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id)
    if (idsNoLeidas.length === 0) return
    await supabase.from('notificaciones').update({ leida: true }).in('id', idsNoLeidas)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return { notificaciones, cargando, noLeidas, marcarLeida, marcarTodasLeidas, recargar: cargar }
}