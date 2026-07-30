import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

const estilos: Record<AlertType, { bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-success-bg', text: 'text-success', Icon: CheckCircle2 },
  error: { bg: 'bg-danger-bg', text: 'text-danger', Icon: XCircle },
  warning: { bg: 'bg-warning-bg', text: 'text-warning', Icon: AlertTriangle },
  info: { bg: 'bg-primary/10', text: 'text-primary', Icon: Info },
}

export function Alert({ type, children }: { type: AlertType; children: ReactNode }) {
  const { bg, text, Icon } = estilos[type]
  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm animate-fade-in-up ${bg} ${text}`}>
      <Icon size={16} className="shrink-0" />
      <span>{children}</span>
    </div>
  )
}