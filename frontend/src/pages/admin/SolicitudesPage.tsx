import { Calendar, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAdminJustificantes } from '../../hooks/useAdminJustificantes'
import { Skeleton } from '../../components/Skeleton'

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

export function SolicitudesPage() {
  const { perfil } = useAuth()
  const { justificantes, cargando, revisar } = useAdminJustificantes(perfil?.id)

  if (cargando) {
    return (
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }

  if (justificantes.length === 0) {
    return <p className="text-sm text-muted bg-white border border-black/5 rounded-2xl shadow-sm p-5">No hay solicitudes todavia.</p>
  }

  return (
    <>
      {/* Vista movil: tarjetas apiladas */}
      <div className="sm:hidden space-y-3">
        {justificantes.map((j, i) => (
          <div key={j.id} className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 space-y-2 animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink text-sm flex items-center gap-1.5">
                <User size={13} /> {j.empleadas?.nombre_completo ?? 'Empleada desconocida'}
              </p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badgeStyle(j.estado)}`}>{j.estado}</span>
            </div>
            <p className="text-sm text-ink capitalize">{j.tipo.replace('_', ' ')}</p>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Calendar size={12} /> {j.fecha_inicio} a {j.fecha_fin}
            </p>
            {j.motivo && <p className="text-xs text-muted italic">"{j.motivo}"</p>}

            {j.estado === 'pendiente' && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => revisar(j.id, 'aprobado')} className="flex-1 text-xs bg-success text-white rounded-lg px-3 py-2 font-medium transition-transform hover:scale-[1.02]">
                  Aprobar
                </button>
                <button onClick={() => revisar(j.id, 'rechazado')} className="flex-1 text-xs bg-danger text-white rounded-lg px-3 py-2 font-medium transition-transform hover:scale-[1.02]">
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista tablet/escritorio: tabla */}
      <div className="hidden sm:block bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
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
              {justificantes.map((j, i) => (
                <tr key={j.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
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
                        <button onClick={() => revisar(j.id, 'aprobado')} className="text-xs bg-success text-white rounded-lg px-3 py-1.5 font-medium transition-transform hover:scale-[1.03]">Aprobar</button>
                        <button onClick={() => revisar(j.id, 'rechazado')} className="text-xs bg-danger text-white rounded-lg px-3 py-1.5 font-medium transition-transform hover:scale-[1.03]">Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}