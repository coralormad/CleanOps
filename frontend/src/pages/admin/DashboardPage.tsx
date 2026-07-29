import { useAdminDashboard } from '../../hooks/useAdminDashboard'

function Tarjeta({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
      <p className="text-xs text-muted mb-1">{etiqueta}</p>
      <p className="font-display font-bold text-2xl text-ink">{valor}</p>
    </div>
  )
}

export function DashboardPage() {
  const { stats, cargando } = useAdminDashboard()

  if (cargando) return <p className="text-sm text-muted">Cargando resumen...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tarjeta etiqueta="Presentes ahora" valor={stats?.presentes ?? 0} />
        <Tarjeta etiqueta="Total empleadas" valor={stats?.totalEmpleadas ?? 0} />
        <Tarjeta etiqueta="Fichajes hoy" valor={stats?.totalFichajesHoy ?? 0} />
        <Tarjeta etiqueta="Pendientes de revisión" valor={stats?.pendientesRevision ?? 0} />
      </div>
      <p className="text-xs text-muted">
        "Presentes ahora" se calcula por el último fichaje del día de cada empleada: si es una entrada
        sin salida registrada todavía, se cuenta como presente.
      </p>
    </div>
  )
}