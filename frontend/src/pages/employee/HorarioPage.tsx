import { useAuth } from '../../hooks/useAuth'
import { useMisTurnos } from '../../hooks/useMisTurnos'
import { ExternalLink } from 'lucide-react'

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

export function HorarioPage() {
  const { perfil } = useAuth()
  const { turnos, cargando } = useMisTurnos(perfil?.id)

  if (cargando) return <p className="text-sm text-muted">Cargando horario...</p>
  if (turnos.length === 0) return <p className="text-sm text-muted">No tienes turnos asignados todavia.</p>

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-black/[0.02]">
              <th className="text-left font-medium text-muted px-4 py-3">Dia</th>
              <th className="text-left font-medium text-muted px-4 py-3">Horario</th>
              <th className="text-left font-medium text-muted px-4 py-3">Edificio</th>
              <th className="text-left font-medium text-muted px-4 py-3 hidden sm:table-cell">Direccion</th>
              <th className="text-left font-medium text-muted px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {turnos.map((t) => {
              const ubicacion = t.ubicaciones_portales
              const enlaceMapa = ubicacion ? 'https://www.google.com/maps/dir/?api=1&destination=' + ubicacion.latitud + ',' + ubicacion.longitud : null

              return (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{DIAS_SEMANA[t.dia_semana]}</td>
                  <td className="px-4 py-3 text-ink whitespace-nowrap">{t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}</td>
                  <td className="px-4 py-3 text-ink">{ubicacion?.nombre ?? 'Edificio'}</td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{ubicacion?.direccion ?? '-'}</td>
                  <td className="px-4 py-3">
                    {enlaceMapa && (
                      <a href={enlaceMapa} target="_blank" rel="noopener noreferrer" className="text-primary font-medium text-xs flex items-center gap-1 whitespace-nowrap">
                        Ir <ExternalLink size={12} />
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}