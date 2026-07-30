import { useAuth } from '../../hooks/useAuth'
import { useAdminJustificantes } from '../../hooks/useAdminJustificantes'

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

export function SolicitudesPage() {
  const { perfil } = useAuth()
  const { justificantes, cargando, revisar } = useAdminJustificantes(perfil?.id)

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
      {cargando && <p className="text-sm text-muted p-5">Cargando solicitudes...</p>}

      {!cargando && justificantes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                <th className="text-left font-medium text-muted px-4 py-3">Tipo</th>
                <th className="text-left font-medium text-muted px-4 py-3">Fechas</th>
                <th className="text-left font-medium text-muted px-4 py-3">Motivo</th>
                <th className="text-left font-medium text-muted px-4 py-3">Estado</th>
                <th className="text-left font-medium text-muted px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {justificantes.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{j.empleadas?.nombre_completo ?? 'Empleada desconocida'}</td>
                  <td className="px-4 py-3 text-ink capitalize whitespace-nowrap">{j.tipo.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-ink whitespace-nowrap">{j.fecha_inicio} a {j.fecha_fin}</td>
                  <td className="px-4 py-3 text-muted max-w-xs truncate">{j.motivo || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeStyle(j.estado)}`}>{j.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    {j.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <button onClick={() => revisar(j.id, 'aprobado')} className="text-xs bg-success text-white rounded-lg px-3 py-1.5 font-medium">Aprobar</button>
                        <button onClick={() => revisar(j.id, 'rechazado')} className="text-xs bg-danger text-white rounded-lg px-3 py-1.5 font-medium">Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && justificantes.length === 0 && <p className="text-sm text-muted p-5">No hay solicitudes todavia.</p>}
    </div>
  )
}