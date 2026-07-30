import { useState } from 'react'
import { Building2, Clock, Navigation, ScanLine } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAdminFichajes } from '../../hooks/useAdminFichajes'
import { Skeleton } from '../../components/Skeleton'

type Filtro = 'todos' | 'pendiente' | 'aprobado' | 'rechazado'

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

function Pill({ etiqueta, valor, activo, color, onClick }: { etiqueta: string; valor: number; activo: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[120px] rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${activo ? 'border-primary bg-primary/5 shadow-sm' : 'border-black/5 bg-white hover:shadow-sm'}`}
    >
      <p className={`text-xs mb-1 ${color}`}>{etiqueta}</p>
      <p className="font-display font-bold text-xl text-ink">{valor}</p>
    </button>
  )
}

export function FichajesPage() {
  const { perfil } = useAuth()
  const { fichajes, cargando, revisar } = useAdminFichajes(perfil?.id)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const conteos = {
    pendiente: fichajes.filter((f) => f.estado_revision === 'pendiente').length,
    aprobado: fichajes.filter((f) => f.estado_revision === 'aprobado').length,
    rechazado: fichajes.filter((f) => f.estado_revision === 'rechazado').length,
  }

  const visibles = filtro === 'todos' ? fichajes : fichajes.filter((f) => f.estado_revision === filtro)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Pill etiqueta="Pendientes" valor={conteos.pendiente} activo={filtro === 'pendiente'} color="text-warning" onClick={() => setFiltro(filtro === 'pendiente' ? 'todos' : 'pendiente')} />
        <Pill etiqueta="Aprobados" valor={conteos.aprobado} activo={filtro === 'aprobado'} color="text-success" onClick={() => setFiltro(filtro === 'aprobado' ? 'todos' : 'aprobado')} />
        <Pill etiqueta="Rechazados" valor={conteos.rechazado} activo={filtro === 'rechazado'} color="text-danger" onClick={() => setFiltro(filtro === 'rechazado' ? 'todos' : 'rechazado')} />
      </div>

      {filtro !== 'todos' && (
        <button onClick={() => setFiltro('todos')} className="text-xs text-primary font-medium underline">
          Ver todos ({fichajes.length})
        </button>
      )}

      {cargando && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!cargando && visibles.map((f, i) => (
        <div
          key={f.id}
          className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-3 transition-all duration-200 hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: `${i * 25}ms` }}
        >
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="font-medium text-ink capitalize">
                {f.empleadas?.nombre_completo ?? 'Empleada desconocida'} · {f.tipo}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Building2 size={12} /> {f.ubicaciones_portales?.nombre ?? 'Edificio desconocido'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {new Date(f.fecha_hora_dispositivo).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <ScanLine size={12} /> {f.metodo}
                </span>
                {f.distancia_metros !== null && (
                  <span className={`flex items-center gap-1 ${f.dentro_del_radio === false ? 'text-danger font-medium' : ''}`}>
                    <Navigation size={12} /> {Math.round(f.distancia_metros)}m
                  </span>
                )}
              </div>
            </div>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${badgeStyle(f.estado_revision)}`}>
              {f.estado_revision}
            </span>
          </div>

          {(f.foto_antes_url || f.foto_despues_url) && (
            <div className="flex gap-3">
              {f.foto_antes_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted">Antes</p>
                  <img src={f.foto_antes_url} alt="Foto antes" className="w-28 h-28 object-cover rounded-xl transition-transform hover:scale-105 cursor-pointer border border-black/5" />
                </div>
              )}
              {f.foto_despues_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted">Despues</p>
                  <img src={f.foto_despues_url} alt="Foto despues" className="w-28 h-28 object-cover rounded-xl transition-transform hover:scale-105 cursor-pointer border border-black/5" />
                </div>
              )}
            </div>
          )}

          {f.estado_revision === 'pendiente' && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => revisar(f.id, 'aprobado')} className="text-xs bg-success text-white rounded-lg px-3 py-1.5 font-medium transition-transform hover:scale-[1.03]">
                Aprobar
              </button>
              <button onClick={() => revisar(f.id, 'rechazado')} className="text-xs bg-danger text-white rounded-lg px-3 py-1.5 font-medium transition-transform hover:scale-[1.03]">
                Rechazar
              </button>
            </div>
          )}
        </div>
      ))}

      {!cargando && visibles.length === 0 && (
        <p className="text-sm text-muted">
          {filtro === 'todos' ? 'No hay fichajes todavia.' : `No hay fichajes con estado "${filtro}".`}
        </p>
      )}
    </div>
  )
}