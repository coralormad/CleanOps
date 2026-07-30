import { useAuth } from '../../hooks/useAuth'
import { useAdminFichajes } from '../../hooks/useAdminFichajes'
import { Skeleton } from '../../components/Skeleton'

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

export function FichajesPage() {
  const { perfil } = useAuth()
  const { fichajes, cargando, revisar } = useAdminFichajes(perfil?.id)

  return (
    <div className="space-y-3">
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

      {!cargando && fichajes.map((f, i) => (
        <div
          key={f.id}
          className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-3 transition-all duration-200 hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: `${i * 25}ms` }}
        >
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="font-medium text-ink">
                {f.empleadas?.nombre_completo ?? 'Empleada desconocida'} — {f.tipo}
              </p>
              <p className="text-xs text-muted">
                {f.ubicaciones_portales?.nombre ?? 'Edificio desconocido'} ·{' '}
                {new Date(f.fecha_hora_dispositivo).toLocaleString()}
              </p>
              <p className="text-xs text-muted">
                Metodo: {f.metodo}
                {f.distancia_metros !== null && <> · {Math.round(f.distancia_metros)}m del edificio</>}
                {f.dentro_del_radio === false && <span className="text-danger"> · fuera de radio</span>}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeStyle(f.estado_revision)}`}>
              {f.estado_revision}
            </span>
          </div>

          {(f.foto_antes_url || f.foto_despues_url) && (
            <div className="flex gap-2">
              {f.foto_antes_url && (
                <img src={f.foto_antes_url} alt="Foto antes" className="w-20 h-20 object-cover rounded-lg transition-transform hover:scale-105 cursor-pointer" />
              )}
              {f.foto_despues_url && (
                <img src={f.foto_despues_url} alt="Foto despues" className="w-20 h-20 object-cover rounded-lg transition-transform hover:scale-105 cursor-pointer" />
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

      {!cargando && fichajes.length === 0 && <p className="text-sm text-muted">No hay fichajes todavia.</p>}
    </div>
  )
}