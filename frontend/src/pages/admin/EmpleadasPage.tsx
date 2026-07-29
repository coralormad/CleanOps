import { useEmpleadas } from '../../hooks/useEmpleadas'

function badgeRol(rol: string) {
  if (rol === 'gerencia') return 'bg-primary/10 text-primary'
  if (rol === 'supervisor') return 'bg-warning-bg text-warning'
  return 'bg-black/5 text-ink'
}

export function EmpleadasPage() {
  const { empleadas, cargando } = useEmpleadas()

  if (cargando) return <p className="text-sm text-muted">Cargando plantilla...</p>

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
      {empleadas.map((e) => (
        <div key={e.id} className="flex items-center justify-between px-5 py-3.5">
          <span className="text-sm text-ink font-medium">{e.nombre_completo}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeRol(e.rol)}`}>{e.rol}</span>
        </div>
      ))}
      {empleadas.length === 0 && <p className="text-sm text-muted p-5">No hay empleadas registradas todavía.</p>}
    </div>
  )
}