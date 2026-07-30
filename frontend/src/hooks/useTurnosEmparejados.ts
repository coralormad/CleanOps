import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TurnoEmparejado {
  id: string
  empleadaId: string
  empleadaNombre: string
  ubicacionNombre: string
  entrada: string
  salida: string | null
  horas: number | null
}

interface Filtros {
  desde: string
  hasta: string
}

interface FichajeCrudo {
  id: string
  empleada_id: string
  tipo: 'entrada' | 'salida'
  fecha_hora_dispositivo: string
  empleadas: { nombre_completo: string } | null
  ubicaciones_portales: { nombre: string } | null
}

export function useTurnosEmparejados(filtros: Filtros) {
  const [turnos, setTurnos] = useState<TurnoEmparejado[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)

    const { data, error } = await supabase
      .from('fichajes')
      .select('id, empleada_id, tipo, fecha_hora_dispositivo, empleadas!fichajes_empleada_id_fkey ( nombre_completo ), ubicaciones_portales ( nombre )')
      .gte('fecha_hora_dispositivo', filtros.desde)
      .lte('fecha_hora_dispositivo', filtros.hasta)
      .order('empleada_id', { ascending: true })
      .order('fecha_hora_dispositivo', { ascending: true })

    if (error || !data) {
      setTurnos([])
      setCargando(false)
      return
    }

    const crudos = data as unknown as FichajeCrudo[]
    const resultado: TurnoEmparejado[] = []
    let entradaAbierta: FichajeCrudo | null = null

    for (const f of crudos) {
      if (f.tipo === 'entrada') {
        if (entradaAbierta) {
          resultado.push({
            id: entradaAbierta.id,
            empleadaId: entradaAbierta.empleada_id,
            empleadaNombre: entradaAbierta.empleadas?.nombre_completo ?? 'Desconocida',
            ubicacionNombre: entradaAbierta.ubicaciones_portales?.nombre ?? 'Edificio',
            entrada: entradaAbierta.fecha_hora_dispositivo,
            salida: null,
            horas: null,
          })
        }
        entradaAbierta = f
      } else {
        if (entradaAbierta && entradaAbierta.empleada_id === f.empleada_id) {
          const horas = (new Date(f.fecha_hora_dispositivo).getTime() - new Date(entradaAbierta.fecha_hora_dispositivo).getTime()) / 3600000
          resultado.push({
            id: entradaAbierta.id,
            empleadaId: entradaAbierta.empleada_id,
            empleadaNombre: entradaAbierta.empleadas?.nombre_completo ?? 'Desconocida',
            ubicacionNombre: entradaAbierta.ubicaciones_portales?.nombre ?? 'Edificio',
            entrada: entradaAbierta.fecha_hora_dispositivo,
            salida: f.fecha_hora_dispositivo,
            horas: Math.round(horas * 100) / 100,
          })
          entradaAbierta = null
        }
      }
    }

    if (entradaAbierta) {
      resultado.push({
        id: entradaAbierta.id,
        empleadaId: entradaAbierta.empleada_id,
        empleadaNombre: entradaAbierta.empleadas?.nombre_completo ?? 'Desconocida',
        ubicacionNombre: entradaAbierta.ubicaciones_portales?.nombre ?? 'Edificio',
        entrada: entradaAbierta.fecha_hora_dispositivo,
        salida: null,
        horas: null,
      })
    }

    resultado.sort((a, b) => new Date(b.entrada).getTime() - new Date(a.entrada).getTime())
    setTurnos(resultado)
    setCargando(false)
  }, [filtros.desde, filtros.hasta])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { turnos, cargando }
}