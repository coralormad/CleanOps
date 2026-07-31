import { useState } from 'react'
import { Download, User, Building2, Clock, Navigation, ScanLine, Calendar } from 'lucide-react'
import { useTurnosEmparejados } from '../../hooks/useTurnosEmparejados'
import { useInformeFueraDeRadio } from '../../hooks/useInformeFueraDeRadio'
import { useAdminJustificantes } from '../../hooks/useAdminJustificantes'
import { useTurnos } from '../../hooks/useTurnos'
import { useAuth } from '../../hooks/useAuth'
import { descargarExcel } from '../../lib/excelExport'
import { formatearFechaHora } from '../../lib/formato'
import { Skeleton } from '../../components/Skeleton'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type Tab = 'horas' | 'asistencia' | 'fueraRadio' | 'justificantes'

function fechaHaceDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function contarOcurrenciasDia(diaSemana: number, desdeISO: string, hastaISO: string): number {
  let contador = 0
  const actual = new Date(desdeISO + 'T12:00:00')
  const fin = new Date(hastaISO + 'T12:00:00')
  while (actual <= fin) {
    const diaJs = actual.getDay()
    const diaNormalizado = diaJs === 0 ? 7 : diaJs
    if (diaNormalizado === diaSemana) contador++
    actual.setDate(actual.getDate() + 1)
  }
  return contador
}

function duracionHoras(inicio: string, fin: string): number {
  const [hIni, mIni] = inicio.slice(0, 5).split(':').map(Number)
  const [hFin, mFin] = fin.slice(0, 5).split(':').map(Number)
  return (hFin * 60 + mFin - (hIni * 60 + mIni)) / 60
}

function FiltroFechas({ desde, hasta, onDesde, onHasta }: { desde: string; hasta: string; onDesde: (v: string) => void; onHasta: (v: string) => void }) {
  return (
    <div className="flex gap-3 flex-wrap items-end">
      <div>
        <label className="text-xs text-muted block mb-1">Desde</label>
        <input type="date" value={desde} onChange={(e) => onDesde(e.target.value)} className="border border-black/10 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs text-muted block mb-1">Hasta</label>
        <input type="date" value={hasta} onChange={(e) => onHasta(e.target.value)} className="border border-black/10 rounded-lg px-3 py-2 text-sm" />
      </div>
    </div>
  )
}

function TablaSkeleton() {
  return (
    <div className="p-5 space-y-3">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
    </div>
  )
}

function TabHoras() {
  const [desde, setDesde] = useState(fechaHaceDias(30))
  const [hasta, setHasta] = useState(hoyISO())
  const { turnos, cargando } = useTurnosEmparejados({ desde: desde + 'T00:00:00', hasta: hasta + 'T23:59:59' })
  const { turnos: turnosAsignados } = useTurnos()

  const trabajadasPorEmpleada = new Map<string, { nombre: string; horas: number }>()
  for (const t of turnos) {
    if (t.horas === null) continue
    const actual = trabajadasPorEmpleada.get(t.empleadaId) ?? { nombre: t.empleadaNombre, horas: 0 }
    actual.horas += t.horas
    trabajadasPorEmpleada.set(t.empleadaId, actual)
  }

  const asignadasPorEmpleada = new Map<string, { nombre: string; horas: number }>()
  for (const t of turnosAsignados) {
    const ocurrencias = contarOcurrenciasDia(t.dia_semana, desde, hasta)
    if (ocurrencias === 0) continue
    const horasTurno = duracionHoras(t.hora_inicio, t.hora_fin) * ocurrencias
    const actual = asignadasPorEmpleada.get(t.empleada_id) ?? { nombre: t.empleadas?.nombre_completo ?? 'Empleada', horas: 0 }
    actual.horas += horasTurno
    asignadasPorEmpleada.set(t.empleada_id, actual)
  }

  const idsUnion = new Set([...trabajadasPorEmpleada.keys(), ...asignadasPorEmpleada.keys()])
  const datosGrafica = [...idsUnion]
    .map((id) => ({
      nombre: trabajadasPorEmpleada.get(id)?.nombre ?? asignadasPorEmpleada.get(id)?.nombre ?? 'Empleada',
      asignadas: Math.round((asignadasPorEmpleada.get(id)?.horas ?? 0) * 100) / 100,
      trabajadas: Math.round((trabajadasPorEmpleada.get(id)?.horas ?? 0) * 100) / 100,
    }))
    .sort((a, b) => b.asignadas - a.asignadas)

  const exportar = () => {
    descargarExcel('horas-trabajadas.xlsx', [{
      nombre: 'Horas trabajadas',
      filas: turnos.map((t) => ({ Empleada: t.empleadaNombre, Edificio: t.ubicacionNombre, Entrada: formatearFechaHora(t.entrada), Salida: formatearFechaHora(t.salida), 'Horas (h)': t.horas ?? '' })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={turnos.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium transition-all hover:scale-[1.03]">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 animate-fade-in-up">
        <h3 className="font-display font-bold text-ink text-sm mb-1">Horas asignadas vs. trabajadas</h3>
        <p className="text-xs text-muted mb-3">Segun los turnos fijados en Configuracion, ajustados al periodo seleccionado arriba.</p>
        {datosGrafica.length === 0 ? (
          <p className="text-sm text-muted">Sin datos en este periodo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(datosGrafica.length * 50, 140)}>
            <BarChart data={datosGrafica} layout="vertical" margin={{ left: 0, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 12, fill: '#1A2226' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(30,75,95,0.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }} formatter={(value) => (Number(value) || 0).toFixed(2) + ' h'} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="asignadas" name="Asignadas" fill="#C9D6DC" radius={[0, 6, 6, 0]} barSize={14} />
              <Bar dataKey="trabajadas" name="Trabajadas" fill="#1E4B5F" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {cargando && <div className="bg-white border border-black/5 rounded-2xl shadow-sm"><TablaSkeleton /></div>}

      {!cargando && turnos.length > 0 && (
        <>
          <div className="sm:hidden space-y-3">
            {turnos.map((t, i) => (
              <div key={t.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                <p className="font-medium text-ink text-sm flex items-center gap-1.5"><User size={13} /> {t.empleadaNombre}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><Building2 size={12} /> {t.ubicacionNombre}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><Clock size={12} /> {formatearFechaHora(t.entrada)} - {formatearFechaHora(t.salida)}</p>
                <p className="text-sm font-medium text-ink pt-1">{t.horas !== null ? t.horas.toFixed(2) + ' h' : 'Sin cerrar'}</p>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Edificio</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Entrada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Salida</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {turnos.map((t, i) => (
                    <tr key={t.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{t.empleadaNombre}</td>
                      <td className="px-4 py-3 text-ink">{t.ubicacionNombre}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.entrada)}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.salida)}</td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{t.horas !== null ? t.horas.toFixed(2) + ' h' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cargando && turnos.length === 0 && <p className="text-sm text-muted bg-white border border-black/5 rounded-2xl shadow-sm p-5">No hay fichajes en este periodo.</p>}
    </div>
  )
}

function TabAsistencia() {
  const [desde, setDesde] = useState(fechaHaceDias(30))
  const [hasta, setHasta] = useState(hoyISO())
  const { turnos, cargando } = useTurnosEmparejados({ desde: desde + 'T00:00:00', hasta: hasta + 'T23:59:59' })

  const ordenados = [...turnos].sort((a, b) => a.ubicacionNombre.localeCompare(b.ubicacionNombre) || new Date(b.entrada).getTime() - new Date(a.entrada).getTime())

  const exportar = () => {
    descargarExcel('asistencia-por-edificio.xlsx', [{
      nombre: 'Asistencia por edificio',
      filas: ordenados.map((t) => ({ Edificio: t.ubicacionNombre, Empleada: t.empleadaNombre, Entrada: formatearFechaHora(t.entrada), Salida: formatearFechaHora(t.salida), 'Horas (h)': t.horas ?? '' })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={ordenados.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium transition-all hover:scale-[1.03]">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      {cargando && <div className="bg-white border border-black/5 rounded-2xl shadow-sm"><TablaSkeleton /></div>}

      {!cargando && ordenados.length > 0 && (
        <>
          <div className="sm:hidden space-y-3">
            {ordenados.map((t, i) => (
              <div key={t.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                <p className="font-medium text-ink text-sm flex items-center gap-1.5"><Building2 size={13} /> {t.ubicacionNombre}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><User size={12} /> {t.empleadaNombre}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><Clock size={12} /> {formatearFechaHora(t.entrada)} - {formatearFechaHora(t.salida)}</p>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="text-left font-medium text-muted px-4 py-3">Edificio</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Entrada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Salida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {ordenados.map((t, i) => (
                    <tr key={t.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{t.ubicacionNombre}</td>
                      <td className="px-4 py-3 text-ink">{t.empleadaNombre}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.entrada)}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.salida)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cargando && ordenados.length === 0 && <p className="text-sm text-muted bg-white border border-black/5 rounded-2xl shadow-sm p-5">No hay fichajes en este periodo.</p>}
    </div>
  )
}

function TabFueraDeRadio() {
  const [desde, setDesde] = useState(fechaHaceDias(30))
  const [hasta, setHasta] = useState(hoyISO())
  const { fichajes, cargando } = useInformeFueraDeRadio({ desde: desde + 'T00:00:00', hasta: hasta + 'T23:59:59' })

  const exportar = () => {
    descargarExcel('fichajes-fuera-de-radio.xlsx', [{
      nombre: 'Fuera de radio',
      filas: fichajes.map((f) => ({ Empleada: f.empleadas?.nombre_completo ?? 'Desconocida', Edificio: f.ubicaciones_portales?.nombre ?? 'Edificio', Tipo: f.tipo, Fecha: formatearFechaHora(f.fecha_hora_dispositivo), 'Distancia (m)': f.distancia_metros ? Math.round(f.distancia_metros) : '' })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={fichajes.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium transition-all hover:scale-[1.03]">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      {cargando && <div className="bg-white border border-black/5 rounded-2xl shadow-sm"><TablaSkeleton /></div>}

      {!cargando && fichajes.length > 0 && (
        <>
          <div className="sm:hidden space-y-3">
            {fichajes.map((f, i) => (
              <div key={f.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                <p className="font-medium text-ink text-sm flex items-center gap-1.5"><User size={13} /> {f.empleadas?.nombre_completo ?? 'Desconocida'}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><Building2 size={12} /> {f.ubicaciones_portales?.nombre ?? 'Edificio'} · <span className="capitalize">{f.tipo}</span></p>
                <p className="text-xs text-muted flex items-center gap-1.5"><ScanLine size={12} /> {formatearFechaHora(f.fecha_hora_dispositivo)}</p>
                {f.distancia_metros && (
                  <p className="text-xs text-danger font-medium flex items-center gap-1.5"><Navigation size={12} /> {Math.round(f.distancia_metros)}m del edificio</p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Edificio</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Tipo</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Fecha</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Distancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {fichajes.map((f, i) => (
                    <tr key={f.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{f.empleadas?.nombre_completo ?? 'Desconocida'}</td>
                      <td className="px-4 py-3 text-ink">{f.ubicaciones_portales?.nombre ?? 'Edificio'}</td>
                      <td className="px-4 py-3 text-ink capitalize">{f.tipo}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(f.fecha_hora_dispositivo)}</td>
                      <td className="px-4 py-3 text-danger whitespace-nowrap">{f.distancia_metros ? Math.round(f.distancia_metros) + ' m' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cargando && fichajes.length === 0 && <p className="text-sm text-muted bg-white border border-black/5 rounded-2xl shadow-sm p-5">No hay fichajes fuera de radio en este periodo.</p>}
    </div>
  )
}

function TabJustificantes() {
  const { perfil } = useAuth()
  const { justificantes, cargando } = useAdminJustificantes(perfil?.id)
  const [desde, setDesde] = useState(fechaHaceDias(90))
  const [hasta, setHasta] = useState(hoyISO())

  const filtrados = justificantes.filter((j) => j.fecha_fin >= desde && j.fecha_inicio <= hasta)

  const exportar = () => {
    descargarExcel('justificantes.xlsx', [{
      nombre: 'Justificantes',
      filas: filtrados.map((j) => ({ Empleada: j.empleadas?.nombre_completo ?? 'Desconocida', Tipo: j.tipo, Desde: j.fecha_inicio, Hasta: j.fecha_fin, Estado: j.estado, Motivo: j.motivo ?? '' })),
    }])
  }

  function badgeStyle(estado: string) {
    if (estado === 'aprobado') return 'bg-success-bg text-success'
    if (estado === 'rechazado') return 'bg-danger-bg text-danger'
    return 'bg-warning-bg text-warning'
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={filtrados.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium transition-all hover:scale-[1.03]">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      {cargando && <div className="bg-white border border-black/5 rounded-2xl shadow-sm"><TablaSkeleton /></div>}

      {!cargando && filtrados.length > 0 && (
        <>
          <div className="sm:hidden space-y-3">
            {filtrados.map((j, i) => (
              <div key={j.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-1.5 animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink text-sm flex items-center gap-1.5"><User size={13} /> {j.empleadas?.nombre_completo ?? 'Desconocida'}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badgeStyle(j.estado)}`}>{j.estado}</span>
                </div>
                <p className="text-xs text-muted capitalize">{j.tipo.replace('_', ' ')}</p>
                <p className="text-xs text-muted flex items-center gap-1.5"><Calendar size={12} /> {j.fecha_inicio} a {j.fecha_fin}</p>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Tipo</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Fechas</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtrados.map((j, i) => (
                    <tr key={j.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{j.empleadas?.nombre_completo ?? 'Desconocida'}</td>
                      <td className="px-4 py-3 text-ink capitalize whitespace-nowrap">{j.tipo.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{j.fecha_inicio} a {j.fecha_fin}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeStyle(j.estado)}`}>{j.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cargando && filtrados.length === 0 && <p className="text-sm text-muted bg-white border border-black/5 rounded-2xl shadow-sm p-5">No hay justificantes en este periodo.</p>}
    </div>
  )
}

export function InformesPage() {
  const [tab, setTab] = useState<Tab>('horas')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'horas', label: 'Horas trabajadas' },
    { id: 'asistencia', label: 'Asistencia por edificio' },
    { id: 'fueraRadio', label: 'Fuera de radio' },
    { id: 'justificantes', label: 'Justificantes' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-black/5 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'horas' && <TabHoras />}
      {tab === 'asistencia' && <TabAsistencia />}
      {tab === 'fueraRadio' && <TabFueraDeRadio />}
      {tab === 'justificantes' && <TabJustificantes />}
    </div>
  )
}