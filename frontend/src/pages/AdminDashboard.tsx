import { useAuth } from '../hooks/useAuth'
import { useAdminFichajes } from '../hooks/useAdminFichajes'

function badgeColor(estado: string) {
  if (estado === 'aprobado') return 'bg-green-100 text-green-800'
  if (estado === 'rechazado') return 'bg-red-100 text-red-800'
  return 'bg-amber-100 text-amber-800'
}

export function AdminDashboard() {
  const { perfil, cerrarSesion } = useAuth()
  const { fichajes, cargando, revisar } = useAdminFichajes(perfil?.id)

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-gray-500">
          Conectada como {perfil?.nombreCompleto} ({perfil?.rol})
        </p>
      </div>

      {cargando && <p className="text-center text-sm text-gray-400">Cargando fichajes...</p>}

      <div className="space-y-3">
        {fichajes.map((f) => (
          <div key={f.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {f.empleadas?.nombre_completo ?? 'Empleada desconocida'} — {f.tipo}
                </p>
                <p className="text-xs text-gray-500">
                  {f.ubicaciones_portales?.nombre ?? 'Edificio desconocido'} ·{' '}
                  {new Date(f.fecha_hora_dispositivo).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  Método: {f.metodo}
                  {f.distancia_metros !== null && (
                    <> · {Math.round(f.distancia_metros)}m del edificio</>
                  )}
                  {f.dentro_del_radio === false && (
                    <span className="text-red-600"> · fuera de radio</span>
                  )}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${badgeColor(f.estado_revision)}`}>
                {f.estado_revision}
              </span>
            </div>

            {(f.foto_antes_url || f.foto_despues_url) && (
              <div className="flex gap-2">
                {f.foto_antes_url && (
                  <img src={f.foto_antes_url} alt="Foto antes" className="w-20 h-20 object-cover rounded" />
                )}
                {f.foto_despues_url && (
                  <img src={f.foto_despues_url} alt="Foto después" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            )}

            {f.estado_revision === 'pendiente' && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => revisar(f.id, 'aprobado')}
                  className="text-xs bg-green-600 text-white rounded px-3 py-1"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => revisar(f.id, 'rechazado')}
                  className="text-xs bg-red-600 text-white rounded px-3 py-1"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}

        {!cargando && fichajes.length === 0 && (
          <p className="text-center text-sm text-gray-400">No hay fichajes todavía.</p>
        )}
      </div>

      <div className="text-center pt-4">
        <button onClick={cerrarSesion} className="text-sm text-red-600 underline">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}