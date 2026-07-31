import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { notificarEmpleada } from '../lib/notificaciones'

export interface JustificanteConDetalle {
  id: string
  empleada_id: string
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  motivo: string | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
  empleadas: { nombre_completo: string } | null
}

export function useAdminJustificantes(revisorId: string | undefined) {
  const [justificantes, setJustificantes] = useState<JustificanteConDetalle[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('justificantes')
      .select('id, empleada_id, tipo, fecha_inicio, fecha_fin, motivo, estado, created_at, empleadas!justificantes_empleada_id_fkey ( nombre_completo )')
      .order('created_at', { ascending: false })

    if (!error && data) setJustificantes(data as unknown as JustificanteConDetalle[])
    setCargando(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const revisar = async (id: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    if (!revisorId) return
    const justificante = justificantes.find((j) => j.id === id)

    await supabase
      .from('justificantes')
      .update({ estado: nuevoEstado, revisado_por: revisorId, revisado_en: new Date().toISOString() })
      .eq('id', id)

    if (justificante) {
      const palabra = nuevoEstado === 'aprobado' ? 'aprobado' : 'rechazado'
      notificarEmpleada(justificante.empleada_id, 'Tu justificante de ' + justificante.tipo + ' ha sido ' + palabra, '/justificantes');
    }

    await cargar();
  }

  return { justificantes, cargando, revisar }
}