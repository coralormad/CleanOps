import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface EstadisticasHoy {
  totalFichajesHoy: number
  pendientesRevision: number
  presentes: number
  totalEmpleadas: number
}

function inicioDelDiaISO(): string {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return hoy.toISOString()
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<EstadisticasHoy | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      setCargando(true)

      const [fichajesHoyRes, pendientesRes, empleadasRes] = await Promise.all([
        supabase
          .from('fichajes')
          .select('empleada_id, tipo, fecha_hora_dispositivo')
          .gte('fecha_hora_dispositivo', inicioDelDiaISO())
          .order('fecha_hora_dispositivo', { ascending: true }),
        supabase.from('fichajes').select('id', { count: 'exact', head: true }).eq('estado_revision', 'pendiente'),
        supabase.from('empleadas').select('id', { count: 'exact', head: true }).eq('rol', 'empleada'),
      ])

      const fichajesHoy = fichajesHoyRes.data ?? []

      const ultimoPorEmpleada = new Map<string, string>()
      for (const f of fichajesHoy) ultimoPorEmpleada.set(f.empleada_id, f.tipo)
      const presentes = [...ultimoPorEmpleada.values()].filter((t) => t === 'entrada').length

      setStats({
        totalFichajesHoy: fichajesHoy.length,
        pendientesRevision: pendientesRes.count ?? 0,
        presentes,
        totalEmpleadas: empleadasRes.count ?? 0,
      })
      setCargando(false)
    }

    cargar()
  }, [])

  return { stats, cargando }
}