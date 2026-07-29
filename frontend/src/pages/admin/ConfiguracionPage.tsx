import { Settings } from 'lucide-react'
import { ProximamentePage } from './ProximamentePage'

export function ConfiguracionPage() {
  return (
    <ProximamentePage
      icon={Settings}
      titulo="Configuración"
      descripcion="Turnos, ubicaciones QR y parámetros generales — pendiente de desarrollo (Fase 2)."
    />
  )
}