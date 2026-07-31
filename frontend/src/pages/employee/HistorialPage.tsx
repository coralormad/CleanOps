import { useState } from 'react'
import { Building2, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useMisFichajes } from '../../hooks/useMisFichajes'
import { useUbicaciones } from '../../hooks/useUbicaciones'
import { Skeleton } from '../../components/Skeleton'

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

export function HistorialPage() {
  const { perfil } = useAuth()
  const { ubicaciones } = useUbicaciones()
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')

  const { fichajes, cargando } = useMisFichajes(perfil?.id, {
    desde: desde ? desde + 'T00:00:00' : undefined,
    hasta: hasta ? hasta + 'T23:59:59' : undefined,
    ubicacionId: ubicacionId || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up">
        <div>
          <label className="text-xs text-muted block mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Edificio</label>
          <select value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos</option>
            {ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
        {cargando && (
          <div className="p-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!cargando && fichajes.map((f, i) => (
          <div key={f.id} className="flex items-center justify-between px-5 py-3.5 gap-3 transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink capitalize">{f.tipo}</p>
              <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                <span className="flex items-center gap-1"><Building2 size={11} /> {f.ubicaciones_portales?.nombre ?? 'Edificio'}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {new Date(f.fecha_hora_dispositivo).toLocaleString()}</span>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badgeStyle(f.estado_revision)}`}>{f.estado_revision}</span>
          </div>
        ))}
        {!cargando && fichajes.length === 0 && <p className="text-sm text-muted p-5">No hay fichajes con estos filtros.</p>}
      </div>
    </div>
  )
}