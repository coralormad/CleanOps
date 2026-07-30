import { useState } from 'react'
import { Download } from 'lucide-react'
import { useTurnosEmparejados } from '../../hooks/useTurnosEmparejados'
import { useInformeFueraDeRadio } from '../../hooks/useInformeFueraDeRadio'
import { useAdminJustificantes } from '../../hooks/useAdminJustificantes'
import { useAuth } from '../../hooks/useAuth'
import { descargarExcel } from '../../lib/excelExport'
import { formatearFechaHora } from '../../lib/formato'

type Tab = 'horas' | 'asistencia' | 'fueraRadio' | 'justificantes'

function fechaHaceDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
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

function TabHoras() {
  const [desde, setDesde] = useState(fechaHaceDias(30))
  const [hasta, setHasta] = useState(hoyISO())
  const { turnos, cargando } = useTurnosEmparejados({ desde: desde + 'T00:00:00', hasta: hasta + 'T23:59:59' })

  const totalesPorEmpleada = new Map<string, { nombre: string; horas: number }>()
  for (const t of turnos) {
    if (t.horas === null) continue
    const actual = totalesPorEmpleada.get(t.empleadaId) ?? { nombre: t.empleadaNombre, horas: 0 }
    actual.horas += t.horas
    totalesPorEmpleada.set(t.empleadaId, actual)
  }

  const exportar = () => {
    descargarExcel('horas-trabajadas.xlsx', [{
      nombre: 'Horas trabajadas',
      filas: turnos.map((t) => ({
        Empleada: t.empleadaNombre,
        Edificio: t.ubicacionNombre,
        Entrada: formatearFechaHora(t.entrada),
        Salida: formatearFechaHora(t.salida),
        'Horas (h)': t.horas ?? '',
      })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={turnos.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4">
        <h3 className="font-display font-bold text-ink text-sm mb-3">Total de horas por empleada</h3>
        <div className="space-y-1.5">
          {[...totalesPorEmpleada.values()].map((v) => (
            <div key={v.nombre} className="flex justify-between text-sm">
              <span className="text-ink">{v.nombre}</span>
              <span className="text-muted font-medium">{v.horas.toFixed(2)} h</span>
            </div>
          ))}
          {totalesPorEmpleada.size === 0 && <p className="text-sm text-muted">Sin datos en este periodo.</p>}
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        {cargando && <p className="text-sm text-muted p-5">Cargando...</p>}
        {!cargando && turnos.length > 0 && (
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
                {turnos.map((t) => (
                  <tr key={t.id}>
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
        )}
        {!cargando && turnos.length === 0 && <p className="text-sm text-muted p-5">No hay fichajes en este periodo.</p>}
      </div>
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
      filas: ordenados.map((t) => ({
        Edificio: t.ubicacionNombre,
        Empleada: t.empleadaNombre,
        Entrada: formatearFechaHora(t.entrada),
        Salida: formatearFechaHora(t.salida),
        'Horas (h)': t.horas ?? '',
      })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={ordenados.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        {cargando && <p className="text-sm text-muted p-5">Cargando...</p>}
        {!cargando && ordenados.length > 0 && (
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
                {ordenados.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{t.ubicacionNombre}</td>
                    <td className="px-4 py-3 text-ink">{t.empleadaNombre}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.entrada)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatearFechaHora(t.salida)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!cargando && ordenados.length === 0 && <p className="text-sm text-muted p-5">No hay fichajes en este periodo.</p>}
      </div>
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
      filas: fichajes.map((f) => ({
        Empleada: f.empleadas?.nombre_completo ?? 'Desconocida',
        Edificio: f.ubicaciones_portales?.nombre ?? 'Edificio',
        Tipo: f.tipo,
        Fecha: formatearFechaHora(f.fecha_hora_dispositivo),
        'Distancia (m)': f.distancia_metros ? Math.round(f.distancia_metros) : '',
      })),
    }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex justify-between items-end flex-wrap gap-3">
        <FiltroFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
        <button onClick={exportar} disabled={fichajes.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        {cargando && <p className="text-sm text-muted p-5">Cargando...</p>}
        {!cargando && fichajes.length > 0 && (
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
                {fichajes.map((f) => (
                  <tr key={f.id}>
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
        )}
        {!cargando && fichajes.length === 0 && <p className="text-sm text-muted p-5">No hay fichajes fuera de radio en este periodo.</p>}
      </div>
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
      filas: filtrados.map((j) => ({
        Empleada: j.empleadas?.nombre_completo ?? 'Desconocida',
        Tipo: j.tipo,
        Desde: j.fecha_inicio,
        Hasta: j.fecha_fin,
        Estado: j.estado,
        Motivo: j.motivo ?? '',
      })),
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
        <button onClick={exportar} disabled={filtrados.length === 0} className="flex items-center gap-2 text-xs bg-primary text-white rounded-lg px-3 py-2 font-medium">
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        {cargando && <p className="text-sm text-muted p-5">Cargando...</p>}
        {!cargando && filtrados.length > 0 && (
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
                {filtrados.map((j) => (
                  <tr key={j.id}>
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
        )}
        {!cargando && filtrados.length === 0 && <p className="text-sm text-muted p-5">No hay justificantes en este periodo.</p>}
      </div>
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