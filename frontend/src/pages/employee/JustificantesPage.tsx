import { FileText } from 'lucide-react'
import { ProximamentePage } from '../admin/ProximamentePage'

export function JustificantesPage() {
  return (
    <ProximamentePage
      icon={FileText}
      titulo="Justificantes"
      descripcion="Envio de justificantes y solicitudes de ausencia - pendiente de desarrollo, junto con su revision desde el panel de administracion."
    />
  )
}