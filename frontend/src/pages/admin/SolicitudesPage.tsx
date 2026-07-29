import { CalendarClock } from 'lucide-react'
import { ProximamentePage } from './ProximamentePage'

export function SolicitudesPage() {
  return (
    <ProximamentePage
      icon={CalendarClock}
      titulo="Solicitudes"
      descripcion="Vacaciones, ausencias y justificaciones — pendiente de desarrollo (Fase 2)."
    />
  )
}