import { useAuth } from '../../hooks/useAuth'
import { useAdminFichajes } from '../../hooks/useAdminFichajes'

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
      {cargando && <p className="text-sm text-muted">Cargando fichajes...</p>}

      {fichajes.map((f) => (
        <div key={f.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-3">
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
                Método: {f.metodo}
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
                <img src={f.foto_antes_url} alt="Foto antes" className="w-20 h-20 object-cover rounded-lg" />
              )}
              {f.foto_despues_url && (
                <img src={f.foto_despues_url} alt="Foto después" className="w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
          )}

          {f.estado_revision === 'pendiente' && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => revisar(f.id, 'aprobado')} className="text-xs bg-success text-white rounded-lg px-3 py-1.5 font-medium">
                Aprobar
              </button>
              <button onClick={() => revisar(f.id, 'rechazado')} className="text-xs bg-danger text-white rounded-lg px-3 py-1.5 font-medium">
                Rechazar
              </button>
            </div>
          )}
        </div>
      ))}

      {!cargando && fichajes.length === 0 && <p className="text-sm text-muted">No hay fichajes todavía.</p>}
    </div>
  )
}