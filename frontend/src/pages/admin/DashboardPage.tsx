import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { useFichajesPorDia } from '../../hooks/useFichajesPorDia'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Skeleton } from '../../components/Skeleton'

function Tarjeta({ etiqueta, valor, cargando }: { etiqueta: string; valor: string | number; cargando: boolean }) {
  if (cargando) {
    return (
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-7 w-16" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up">
      <p className="text-xs text-muted mb-1">{etiqueta}</p>
      <p className="font-display font-bold text-2xl text-ink">{valor}</p>
    </div>
  )
}

export function DashboardPage() {
  const { stats, cargando } = useAdminDashboard()
  const { datos, cargando: cargandoChart } = useFichajesPorDia()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tarjeta etiqueta="Presentes ahora" valor={stats?.presentes ?? 0} cargando={cargando} />
        <Tarjeta etiqueta="Total empleadas" valor={stats?.totalEmpleadas ?? 0} cargando={cargando} />
        <Tarjeta etiqueta="Fichajes hoy" valor={stats?.totalFichajesHoy ?? 0} cargando={cargando} />
        <Tarjeta etiqueta="Pendientes de revision" valor={stats?.pendientesRevision ?? 0} cargando={cargando} />
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 animate-fade-in-up">
        <h3 className="font-display font-bold text-ink text-sm mb-4">Fichajes de los ultimos 7 dias</h3>
        {cargandoChart ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 12, fill: '#6B7680' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7680' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip cursor={{ fill: 'rgba(30,75,95,0.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }} />
              <Bar dataKey="total" name="Fichajes" fill="#1E4B5F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-xs text-muted">
        "Presentes ahora" se calcula por el ultimo fichaje del dia de cada empleada: si es una entrada
        sin salida registrada todavia, se cuenta como presente.
      </p>
    </div>
  )
}